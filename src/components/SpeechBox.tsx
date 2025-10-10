export default function SpeechBox() {
  return (
    <div className="relative z-50 max-w-md mx-auto text-left">
      {/* Bubble body */}
      <div className="speech-box p-4 bg-[#0f0f0f]/80 border border-[#00FF80]/30 rounded-lg shadow-lg backdrop-blur-md text-[#00FF80]">
        <p className="text-sm text-[#7fffca] leading-relaxed">
          This website runs entirely in a terminal. You can type commands to explore it. Type&nbsp;
          <span className="text-[#00FF80] font-bold">'help'</span> to get started.
        </p>
        <p className="text-xs mt-3 text-[#b8ffe9] leading-relaxed">
          Try commands like&nbsp;
          <span className="text-[#00FF80] font-semibold">'cd posts'</span> to enter the posts folder,&nbsp;
          <span className="text-[#00FF80] font-semibold">'ls'</span> to list posts,&nbsp;
          <span className="text-[#00FF80] font-semibold">'cat the_downfall_of_faas.md'</span> to read one,&nbsp;
          <span className="text-[#00FF80] font-semibold">'cls'</span> to clear the screen,&nbsp; and
          <span className="text-[#00FF80] font-semibold">'about'</span> to learn more about me.
        </p>
      </div>

    </div>
  );
}
