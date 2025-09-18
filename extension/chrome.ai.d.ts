// extension/chrome.ai.d.ts

declare namespace chrome.ai {
  interface TextSession {
    proofread(text: string): Promise<{ proofreadText: string; edits: any[] }>;
    rewrite(text: string): Promise<{ candidates: { text: string }[] }>;
  }

  const text: {
    availability(options: { text: string[] }): Promise<'available' | 'downloadable' | 'downloading' | 'unavailable'>;
    create(options: { text: string[] }): Promise<TextSession>;
  };
}