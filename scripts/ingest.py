#!/usr/bin/env python3
"""
Ingest Script for Jarvis AI Assistant
Processes documents and uploads embeddings to Pinecone

Usage:
    python scripts/ingest.py --file path/to/document.pdf
    python scripts/ingest.py --dir path/to/documents/
    python scripts/ingest.py --jsonl docs/sample_docs.jsonl

Requirements:
    pip install sentence-transformers pinecone-client PyPDF2 python-dotenv
"""

import os
import sys
import json
import argparse
from pathlib import Path
from typing import List, Dict
import hashlib

# Environment
from dotenv import load_dotenv
load_dotenv()

# Pinecone
from pinecone import Pinecone, ServerlessSpec

# Embeddings
EMBEDDING_PROVIDER = os.getenv('EMBEDDING_PROVIDER', 'local')  # 'local' or 'openai'

if EMBEDDING_PROVIDER == 'openai':
    import openai
    openai.api_key = os.getenv('OPENAI_API_KEY')
else:
    from sentence_transformers import SentenceTransformer
    # Load model once
    print("Loading sentence-transformers model...")
    embedding_model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

# PDF parsing
try:
    from PyPDF2 import PdfReader
except ImportError:
    print("Warning: PyPDF2 not installed. PDF support disabled.")
    PdfReader = None


def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
    """
    Split text into overlapping chunks.
    """
    chunks = []
    start = 0

    while start < len(text):
        end = min(start + chunk_size, len(text))
        chunk = text[start:end]
        chunks.append(chunk)

        start = end - overlap
        if start >= len(text) - overlap:
            break

    return chunks


def generate_embedding(text: str, provider: str = 'local') -> List[float]:
    """
    Generate embedding vector for text.
    """
    if provider == 'openai':
        # Use OpenAI embeddings
        response = openai.Embedding.create(
            input=text,
            model=os.getenv('EMBEDDING_MODEL', 'text-embedding-3-small')
        )
        return response['data'][0]['embedding']
    else:
        # Use local sentence-transformers
        embedding = embedding_model.encode(text, convert_to_numpy=True)
        return embedding.tolist()


def extract_text_from_file(file_path: str) -> str:
    """
    Extract text from file (PDF or TXT).
    """
    file_path = Path(file_path)

    if file_path.suffix.lower() == '.pdf':
        if not PdfReader:
            raise ValueError("PDF support requires PyPDF2: pip install PyPDF2")

        reader = PdfReader(str(file_path))
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text

    elif file_path.suffix.lower() in ['.txt', '.md']:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()

    else:
        raise ValueError(f"Unsupported file type: {file_path.suffix}")


def ingest_document(
    text: str,
    source: str,
    pinecone_index,
    namespace: str = '',
    chunk_size: int = 500,
    overlap: int = 50,
) -> Dict:
    """
    Process and ingest a document into Pinecone.
    """
    # Generate document ID
    doc_id = hashlib.md5(source.encode()).hexdigest()[:12]

    # Chunk text
    chunks = chunk_text(text, chunk_size, overlap)
    print(f"  Created {len(chunks)} chunks")

    # Generate embeddings and prepare vectors
    vectors = []
    for i, chunk in enumerate(chunks):
        print(f"  Processing chunk {i+1}/{len(chunks)}...", end='\r')

        embedding = generate_embedding(chunk, EMBEDDING_PROVIDER)

        vector = {
            'id': f"{doc_id}_chunk_{i}",
            'values': embedding,
            'metadata': {
                'text': chunk,
                'source': source,
                'chunk_index': i,
                'total_chunks': len(chunks),
                'doc_id': doc_id,
            }
        }
        vectors.append(vector)

    print(f"  Processing chunk {len(chunks)}/{len(chunks)}... Done!")

    # Upsert to Pinecone (batch)
    print(f"  Uploading to Pinecone...")
    batch_size = 100
    for i in range(0, len(vectors), batch_size):
        batch = vectors[i:i+batch_size]
        pinecone_index.upsert(vectors=batch, namespace=namespace)

    return {
        'doc_id': doc_id,
        'source': source,
        'chunks': len(chunks),
        'characters': len(text),
    }


def main():
    parser = argparse.ArgumentParser(description='Ingest documents into Pinecone')
    parser.add_argument('--file', help='Single file to ingest')
    parser.add_argument('--dir', help='Directory of files to ingest')
    parser.add_argument('--jsonl', help='JSONL file with documents')
    parser.add_argument('--namespace', default='', help='Pinecone namespace')
    parser.add_argument('--chunk-size', type=int, default=500, help='Chunk size')
    parser.add_argument('--overlap', type=int, default=50, help='Chunk overlap')

    args = parser.parse_args()

    # Validate environment
    if not os.getenv('PINECONE_API_KEY'):
        print("Error: PINECONE_API_KEY not set")
        sys.exit(1)

    # Initialize Pinecone
    print("Connecting to Pinecone...")
    pc = Pinecone(api_key=os.getenv('PINECONE_API_KEY'))

    index_name = os.getenv('PINECONE_INDEX_NAME', 'jarvis-knowledge')

    # Check if index exists, create if not
    if index_name not in pc.list_indexes().names():
        print(f"Creating index '{index_name}'...")
        dimension = 384 if EMBEDDING_PROVIDER == 'local' else 1536
        pc.create_index(
            name=index_name,
            dimension=dimension,
            metric='cosine',
            spec=ServerlessSpec(
                cloud='aws',
                region=os.getenv('PINECONE_ENVIRONMENT', 'us-east-1')
            )
        )

    index = pc.Index(index_name)
    print(f"Connected to index: {index_name}")

    # Process files
    results = []

    if args.file:
        # Single file
        print(f"\nIngesting file: {args.file}")
        text = extract_text_from_file(args.file)
        result = ingest_document(
            text,
            args.file,
            index,
            args.namespace,
            args.chunk_size,
            args.overlap,
        )
        results.append(result)

    elif args.dir:
        # Directory
        directory = Path(args.dir)
        files = list(directory.glob('*.pdf')) + list(directory.glob('*.txt'))

        for file_path in files:
            print(f"\nIngesting file: {file_path}")
            try:
                text = extract_text_from_file(file_path)
                result = ingest_document(
                    text,
                    str(file_path),
                    index,
                    args.namespace,
                    args.chunk_size,
                    args.overlap,
                )
                results.append(result)
            except Exception as e:
                print(f"  Error: {e}")

    elif args.jsonl:
        # JSONL file
        with open(args.jsonl, 'r') as f:
            for line_num, line in enumerate(f, 1):
                try:
                    doc = json.loads(line)
                    print(f"\nIngesting document {line_num}: {doc.get('source', 'unknown')}")

                    result = ingest_document(
                        doc['text'],
                        doc.get('source', f'doc_{line_num}'),
                        index,
                        args.namespace,
                        args.chunk_size,
                        args.overlap,
                    )
                    results.append(result)
                except Exception as e:
                    print(f"  Error on line {line_num}: {e}")

    else:
        parser.print_help()
        sys.exit(1)

    # Summary
    print("\n" + "="*60)
    print("INGESTION SUMMARY")
    print("="*60)
    print(f"Total documents: {len(results)}")
    print(f"Total chunks: {sum(r['chunks'] for r in results)}")
    print(f"Total characters: {sum(r['characters'] for r in results)}")
    print("="*60)

    # Save results
    results_file = 'ingestion_results.json'
    with open(results_file, 'w') as f:
        json.dump(results, f, indent=2)
    print(f"\nResults saved to: {results_file}")


if __name__ == '__main__':
    main()
