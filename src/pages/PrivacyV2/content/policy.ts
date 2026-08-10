/**
 * Privacy policy copy — transcribed verbatim from Figma node 2066:27
 * ("Content — Privacy Policy").
 *
 * This is legal copy, so nothing here is authored or paraphrased: the wording,
 * punctuation and section order all come straight from the design. Only the
 * structure is ours — the text is modelled as data so LegalDoc stays declarative
 * and a future copy change is a one-line edit here.
 *
 * Section numbers are NOT stored: they're derived from array order in LegalDoc,
 * so the sequence can never drift out of step.
 */

import { Inline, InlineLink, LegalDocContent, Section } from "@Components/LegalDoc/types";

// The three contact links the copy reuses throughout.
const SITE: InlineLink = { text: "www.amberstudent.com", href: "https://www.amberstudent.com", newTab: true };
const PHONE: InlineLink = { text: "+44 7456741634", href: "tel:+447456741634" };
const EMAIL: InlineLink = { text: "contact@amberstudent.com", href: "mailto:contact@amberstudent.com" };

const INTRO: Inline[][] = [
  [
    "We, Amber Internet solutions Inc. Hereinafter also referred to as “amber”, a company incorporated under the laws of USA, having its registered office at 40 E Main St #1215 Newark DE, USA is the creator of this Privacy Policy. For the purpose of data protection act, Amber Internet solutions Inc. is the data controller.",
  ],
  [
    "To ensure better protection of your privacy, we provide this notice explaining our information collection and disclosing policies, and the choices you make and your rights about the way your information is collected and used. By visiting ",
    SITE,
    " you are accepting and consenting to the practices described in this policy.",
  ],
  [
    "If You have any queries or concerns regarding this privacy policy, You should contact Our Customer Support Desk at ",
    PHONE,
    " / email Us at ",
    EMAIL,
    ".",
  ],
];

const CALLOUT =
  "Any capitalized words used henceforth shall have the meaning accorded to them under this agreement.";

const SECTIONS: Section[] = [
  {
    title: "Definitions",
    blocks: [
      {
        kind: "list",
        markers: "letters",
        items: [
          ["“We”, “Our”, and “Us” shall mean and refer to the creators of this privacy policy."],
          ["“You”, “Your”, “Yourself” and “User” shall mean individuals who use the website."],
          [
            "“Third Parties” refer to any application, website, company or individual apart from amber.",
          ],
          ["“Accommodation” refers to student rooms, individual apartments, houses etc"],
          [
            "”third party accommodation partner” refers to the our accommodation partners which includes property management groups, individual property managers, landlords etc",
          ],
        ],
      },
    ],
  },
  {
    title: "Information Given by You",
    blocks: [
      {
        kind: "para",
        content: [
          "You can give us the information by filling the request form at amber, over call, email or at various offline promotional events. The informational you give us may include your name, phone number, email id.",
        ],
      },
      {
        kind: "para",
        content: [
          "For booking your accommodation at amber you may need to give further personal information (ex. Birth date, country of origin, guarantor’s details, University name etc) on call or email or other messaging services as necessary",
        ],
      },
    ],
  },
  {
    title: "Information We Collect From You",
    blocks: [
      { kind: "para", content: ["We collect the following information:"] },
      {
        kind: "list",
        markers: "bullets",
        items: [
          ["IP address, browser type, operating system type and platforms"],
          ["Login information"],
          ["URL informational"],
          ["Page interactions like clicking and scrolling"],
          ["Phone number or email you used to call or email amberstudent"],
          ["Information about your visit through and from our website"],
        ],
      },
      {
        kind: "para",
        content: [
          "We are working with advertising networks and business partners (other sources) and may receive information about you from them.",
        ],
      },
    ],
  },
  {
    title: "Cookies",
    blocks: [
      {
        kind: "para",
        content: [
          "We use data collection device known as “cookies” at our website. “Cookies” are small files situated on Your mobile/ computer/ device’s hard disk that assists Us in providing customised services. A cookie helps us analyse your preferences by, for example, recording the number of times you have used the Website, and help us in tailoring our services to suit your interests.",
        ],
      },
      {
        kind: "para",
        content: [
          "We use various analytics tools and social media engagement tool which sets a cookie on your device. Data may be collected by social media companies that may enable them showing advertisements. A “cookie” does not give Us access to your device. You may choose to disable the “cookie” feature on Your device.",
        ],
      },
      {
        kind: "para",
        content: [
          "Using our online chat functionality may also mean that we collect information on your country and IP address. This information will not be used for any purpose other than to enhance the functionality the website.",
        ],
      },
    ],
  },
  {
    title: "Our Use of Your Information",
    blocks: [
      {
        kind: "para",
        content: [
          "No mobile information will be shared with third parties/affiliates for marketing/promotional purposes. The information given by you shall be used to contact You when necessary. After your oral or written confirmation, information will be passed on to our third party accommodation partners or your university or relevant authorities for booking your Accommodation. Please read third party accommodation partner’s privacy policy before giving oral or written confirmation",
        ],
      },
      {
        kind: "para",
        content: [
          "We can send you details about our services or blog posts and to notify about changes in service.",
        ],
      },
      {
        kind: "para",
        content: [
          "The information we collected from you can be used to improve our services, analytics, research, survey, advertisement and make suggestions to you and other users of the accommodations.",
        ],
      },
      {
        kind: "para",
        content: [
          "We may combine information given by other sources with information you give to us and information we collect about you. We may use information given by other sources and the combined information for the above purposes.",
        ],
      },
    ],
  },
  {
    title: "Disclosure of Your Information to Third Parties",
    blocks: [
      {
        kind: "list",
        markers: "bullets",
        items: [
          [
            "Information will be passed on to our third party accommodation partners for booking your Accommodation after your oral or written confirmation.",
          ],
          [
            "Analytics and search engine providers that assist us in the improvement and optimisation of our site.",
          ],
          ["In case We get acquired by a company, we may share your information to that company"],
          [
            "If we are under a duty to disclose or share your personal data in order to comply with any legal obligation or to protect privacy and safety of amber or other user we can disclose your information to various government agencies and/or third party enforcement agencies",
          ],
        ],
      },
    ],
  },
  {
    title: "Accessing, Reviewing, Changing Your Information and Your Rights",
    blocks: [
      {
        kind: "para",
        content: [
          "If you believe that any information we are holding on you is incorrect or incomplete please write to or email us as soon as possible, at ",
          EMAIL,
          " or contact us at ",
          PHONE,
          ". We shall promptly correct any information found to be incorrect.",
        ],
      },
      {
        kind: "para",
        content: [
          "You have a right to ask us not to use your personal information for marketing purpose. Please contact ",
          EMAIL,
          " if you wish to opt out of marketing campaigns or any other services.",
        ],
      },
      {
        kind: "para",
        content: [
          "You have right to access your data. Please send us an email at ",
          EMAIL,
          " if you want to access your data which is with us. We will provide you the your information free of cost.",
        ],
      },
      {
        kind: "para",
        content: [
          "You have right to ask us not to process your data or to delete your data. Please send us an email at ",
          EMAIL,
          " if you want to exercise ay of the rights.",
        ],
      },
    ],
  },
  {
    title: "Where We Save Your Data",
    blocks: [
      {
        kind: "para",
        content: [
          "The data that we collect from you is processed by staff operating outside the EEA who work for us. Such staff maybe engaged in, among other things, the fulfilment of your accommodation booking. By submitting your personal data, you agree to this transfer, storing or processing. We will take all steps reasonably necessary to ensure that your data is treated securely and in accordance with this privacy policy.",
        ],
      },
      {
        kind: "para",
        content: [
          "All information you provide to us is stored on secure servers. Where you have chosen a password which enables you to access certain parts of our site, you are responsible for keeping this password confidential. We ask you not to share a password with anyone.",
        ],
      },
      {
        kind: "para",
        content: [
          "Unfortunately, the transmission of information via the internet is not completely secure. Although we will do our best to protect your personal data, we cannot guarantee the security of your data transmitted to our site; any transmission is at your own risk. Once we have received your information, we will use strict procedures and security features to try to prevent unauthorised access.",
        ],
      },
    ],
  },
  {
    title: "Third Party Sites",
    blocks: [
      {
        kind: "para",
        content: [
          "Our Site may contain links to third party sites, including sites with which we have affiliate agreements. We have no control and hence not responsible for the privacy practices or the content of such third party websites. This Privacy Policy extends only to personal data we collect from you either via our website. We recommend that you check the privacy and security policies and procedures of each and every other website that you visit.",
        ],
      },
    ],
  },
  {
    title: "Amendment",
    blocks: [
      {
        kind: "para",
        content: [
          "Our Privacy Policy may change from time to time. Hence we shall post any privacy policy changes on this page",
        ],
      },
    ],
  },
];

const PRIVACY_CONTENT: LegalDocContent = {
  intro: INTRO,
  callout: CALLOUT,
  sections: SECTIONS,
};

export default PRIVACY_CONTENT;
