/**
 * The partner marks.
 *
 * ⚠️  THIS FILE USED TO BE A COMPONENT. It exported a `LogoStrip` that rendered an
 * eyebrow over a row of marks, and two configured instances of it: `UniversityPartners`
 * inside the hero, and a `Partners` band between the benefits and the testimonials.
 * Both are gone — the band because it read as a detached strip belonging to neither
 * section around it, and the hero's university strip by request — so the component, its
 * wrapper, its stylesheet and the university logo table went with them.
 *
 * What is left is the data. It is consumed by Audience, which draws the marks itself as
 * the last row of "Built for partners like you". The filename is now a misnomer and the
 * module could reasonably be renamed `partnerLogos.ts`; it is left alone so the one
 * import that reaches it does not have to move.
 */
import partner1 from "../../assets/logos/partner-1.jpg";
import partner2 from "../../assets/logos/partner-2.jpg";
import partner3 from "../../assets/logos/partner-3.jpg";
import partner4 from "../../assets/logos/partner-4.jpg";
import partner5 from "../../assets/logos/partner-5.jpg";
import partner6 from "../../assets/logos/partner-6.jpg";

export type Logo = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export const PARTNER_LOGOS: Logo[] = [
  { src: partner1, alt: "Educred", width: 162, height: 58 },
  { src: partner2, alt: "ErasmusPlay", width: 162, height: 58 },
  { src: partner3, alt: "Study Smart", width: 162, height: 58 },
  { src: partner4, alt: "LeapScholar", width: 151, height: 54 },
  { src: partner5, alt: "iSchoolConnect", width: 162, height: 58 },
  { src: partner6, alt: "MiM-Essay", width: 140, height: 50 },
];
