type SectionHeadingProps = {
  tag?: string;
  supportingText?: string;
  className?: string;
  centered?: boolean;
};

export const SectionHeading = ({
  tag,
  supportingText,
  className = "",
  centered = false,
}: SectionHeadingProps) => {
  return (
    <div className={`mb-8 flex flex-col gap-3 ${centered ? "items-center text-center" : "items-start"} ${className}`}>
      {tag ? <span className="inline-flex rounded-full border border-[#2d3a31] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#1f2a23]">
        {tag}
      </span> : null}
      {supportingText ? (
        <p className="text-2xl font-medium leading-tight text-[#2e3f34] capitalize md:text-4xl">
          {supportingText}
        </p>
      ) : null}
    </div>
  );
};

export default SectionHeading;
