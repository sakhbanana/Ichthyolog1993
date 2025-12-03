export async function safeCopy(text: string): Promise<boolean> {
    try {
      if (typeof navigator === "undefined") return false;
      if (!navigator.clipboard) return false;
  
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }
  