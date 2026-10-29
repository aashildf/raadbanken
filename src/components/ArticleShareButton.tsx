"use client";

import { IconShare } from "@/components/icons";

export function ArticleShareButton({ title }: { title: string }) {
  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // Brukeren avbrøt delingsdialogen.
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
      } catch {
        // Utklippstavle utilgjengelig.
      }
    }
  }

  return (
    <button
      type="button"
      aria-label="Del artikkelen"
      onClick={handleShare}
      className="grid h-12 w-12 place-items-center rounded-[2px] text-[#111110] shadow-[inset_0_0_0_1px_#111110] transition-colors duration-[550ms] [transition-timing-function:cubic-bezier(0.3,0.6,0.25,1)] delay-[60ms] hover:bg-[#111110] hover:text-[#f5eee0]"
    >
      <IconShare className="h-[18px] w-[18px]" />
    </button>
  );
}
