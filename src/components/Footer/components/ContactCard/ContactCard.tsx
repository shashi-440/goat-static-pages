import { FC, ReactNode } from "react";
import CustomLink from "@Components/CustomLink";
import classes from "./ContactCard.module.scss";

interface ContactCardProps {
  icon: ReactNode;
  label: string;
  link: string;
}

/**
 * Port of amber-user-website's footer ContactCard. Identical markup; the gtag
 * click event is dropped since this sandbox ships no analytics.
 */
const ContactCard: FC<ContactCardProps> = ({ icon, label, link }) => (
  <CustomLink
    href={link}
    target="_blank"
    rel="noreferrer"
    isExternal
    className={classes.outerDiv}
    dataTestId={label}
  >
    {/* Wrapped in a fragment: CustomLink's children prop is typed as a single
        ReactNode, matching react-router's LinkProps. */}
    <>
      {icon}
      <div className={classes.label}>{label}</div>
    </>
  </CustomLink>
);

export default ContactCard;
