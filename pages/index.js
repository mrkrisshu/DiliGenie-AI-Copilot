/**
 * Landing Page
 * Hero section with anomalous matter effect
 */

import Head from "next/head";
import { AnomalousMatterHero } from "../@/components/ui/anomalous-matter-hero";

export default function Landing() {
  return (
    <>
      <Head>
        <title>DiliGenie - Your AI Copilot for Intelligent Conversations</title>
        <meta
          name="description"
          content="Powered by Retrieval-Augmented Generation, DiliGenie helps you chat with your documents, automate tasks, and generate insights — all in one conversational workspace."
        />
        <link rel="icon" href="/favicon.svg" />
      </Head>

      <AnomalousMatterHero />
    </>
  );
}
