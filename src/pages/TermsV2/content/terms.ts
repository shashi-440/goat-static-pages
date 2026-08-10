/**
 * Terms & Conditions copy — transcribed verbatim from https://amberstudent.com/terms
 * (the live page; upstream stores this text in Tolgee under `terms.*`, so it is
 * not in src/locales/en/translation.json).
 *
 * This is legal copy, so nothing here is authored or paraphrased. Three
 * presentation-only changes were made, each of them a fix to how the live page
 * renders rather than to what it says:
 *
 *   1. Clause titles lost their trailing colons. Upstream they are bold inline
 *      paragraphs where a colon reads as punctuation; here they are h2s.
 *   2. Clause 7 ends "…to obtain the return of your" / "Deposit." as two separate
 *      paragraphs upstream, splitting a sentence. Rejoined.
 *   3. Clause 16 runs sentences together with no space after the full stop
 *      ("…time of booking.The non-refundable…"). Spaces restored.
 *
 * Section numbers are NOT stored: they're derived from array order in LegalDoc,
 * so the sequence can never drift out of step.
 */

import { Inline, InlineLink, LegalDocContent, Section } from "@Components/LegalDoc/types";

const SITE: InlineLink = {
  text: "www.amberstudent.com",
  href: "https://www.amberstudent.com",
  newTab: true,
};
const EMAIL: InlineLink = {
  text: "contact@amberstudent.com",
  href: "mailto:contact@amberstudent.com",
};

const INTRO: Inline[][] = [
  [
    "These terms of use (together with the documents referred to in them) tell you the terms of use on which you may use or access ",
    SITE,
    ", a subdomain or any such related websites and/or mobile application for such website (our “Sites”) whether as a guest or registered user. Use of our Sites includes accessing, browsing or registering for an account. If you log in to our Sites through a third party such as Facebook, Google etc. then you will be bound by these terms when you reach our Site.",
  ],
  [
    "Please read and accept these terms of use carefully before using our Sites, as these will apply to your use of our Sites.",
  ],
];

const CALLOUT = "If you do not agree to these terms of use, you must not use our Sites.";

const SECTIONS: Section[] = [
  {
    title: "Other Applicable Terms",
    blocks: [
      {
        kind: "para",
        content: [
          "These terms of use refer to the following additional terms, which also apply to your use of our Sites:",
        ],
      },
    ],
  },
  {
    title: "Information about us",
    blocks: [
      {
        kind: "para",
        content: [
          "Our Site is operated by ",
          { text: "Amber Internet solutions Inc.", strong: true },
          " With the registered office at 40 E Main St #1215 Newark DE, USA",
        ],
      },
    ],
  },
  {
    title: "Accessing our Sites",
    blocks: [
      {
        kind: "para",
        content: [
          "We do not guarantee that our Sites, or any content on them, will always be available or be uninterrupted. Access to our Sites is permitted on a temporary basis. We may suspend, withdraw, discontinue or change all or any part of our Sites without notice. We will not be liable to you if for any reason our Sites are unavailable at any time or for any period.",
        ],
      },
      {
        kind: "para",
        content: [
          "You are responsible for making all arrangements necessary for you to have access to our Sites.",
        ],
      },
      {
        kind: "para",
        content: [
          "You are also responsible for ensuring that any persons with access to our Sites through your internet connection are aware of these terms of use and the other applicable terms and conditions listed above, and that they comply with them.",
        ],
      },
    ],
  },
  {
    title: "Your account and password",
    blocks: [
      {
        kind: "para",
        content: [
          "In order to register for an account on our Sites you must be aged 18 or over at the point of registration or be 13 or older and have your parent or guardian’s consent to register for an account on our Sites. You must (or your parent or guardian acting on your behalf) have the power to enter a binding contract with us and not be barred from doing so under any applicable laws.",
        ],
      },
      {
        kind: "para",
        content: [
          "If you choose, or you are provided with, any user identification code, password or any other piece of information as part of our security procedures to set up an account, you must treat such information as confidential. You must not disclose it to any third party.",
        ],
      },
      {
        kind: "para",
        content: [
          "We have the right to disable any user identification code or password, whether chosen by you or allocated by us, at any time, if in our reasonable opinion you have failed to comply with applicable law or any of the provisions of these terms of use and/or if we believe that your account is being used in an unauthorised or fraudulent manner.",
        ],
      },
      {
        kind: "para",
        content: [
          "If you know or suspect that anyone other than you knows your user identification code or password you must promptly notify us at ",
          EMAIL,
          ". Following such notification you may be required to set up a new account with a new identification code and/or password.",
        ],
      },
    ],
  },
  {
    title: "Agreements between Users of Our Sites",
    blocks: [
      {
        kind: "para",
        content: [
          "Our Sites allow property owners and managers to advertise their properties (each, an “Advertiser”) to potential student tenants (each, a “Student”).",
        ],
      },
      {
        kind: "para",
        content: [
          "You may use the Sites as a guest user or a registered user. Once you have discovered a property that best suits your needs, you can make an enquiry and complete the booking request form. The booking request form includes your name, email address, phone number and information concerning the length of stay. No payment details are required at this stage and there is no commitment to rent a room. Your allocated booking consultant will then contact you to confirm and discuss the accommodation type that you require. Contact may be made via email, call, whatsapp. We do not own or manage, nor do we contract for, any rental property listed on our Sites. We will not be a party to any agreement between an Advertiser and a Student. The terms of any agreement entered into between an Advertiser and a Student may vary from Advertiser to Advertiser. It is your responsibility to review and agree to an Advertiser’s specific terms including the Advertiser’s terms relating to payments and cancellations where payment is made via our Sites. All aspects of a transaction between a Student and an Advertiser, including (but not limited to) the quality, condition, safety or legality of the properties advertised and the ability of a user to enter into a transaction are solely the responsibility of each user. This includes the terms of any security deposit, which are set by the Advertiser. We do not represent, or negotiate, or carry out research on the part of or act on behalf of either Advertisers or Students.",
        ],
      },
      {
        kind: "para",
        content: [
          "We do not accept any responsibility for the confirmation of a Student and/or Advertiser’s identity. Where a third party (for example an education or travel agent) acts on a Student’s behalf, it is the Student’s responsibility to ensure the accuracy of the information provided by the third party. We encourage users to take all such steps as necessary to communicate directly with a Student/Advertiser (as applicable) to assure yourself of the other person’s identity, details of the property and any tenancy agreement.",
        ],
      },
      {
        kind: "para",
        content: [
          "By providing your contact information on our platform, you agree to allow amber to contact you via email/call/sms for assistance, use your name to help others decide on the platform and also send you marketing/promotional content.",
        ],
      },
    ],
  },
  {
    title: "Prices",
    blocks: [
      {
        kind: "para",
        content: [
          "The prices of properties displayed on the Sites are liable to change at any time. Despite our best efforts, some of the prices listed on the Sites may be incorrect. We expressly reserve the right to correct any pricing errors on our Sites and/or on potential bookings which have not yet been completed.",
        ],
      },
      {
        kind: "para",
        content: [
          "We display the prices that Advertisers provide to us from time to time. We are not responsible or liable for the accuracy of the prices displayed, to the maximum extent permitted by applicable law.",
        ],
      },
      {
        kind: "para",
        content: [
          "Due to the international nature of our Sites, the currency of the prices shown may vary depending on your location. Currency rates given on the Sites are based on various publicly available sources and should be used as guidelines only. Rates are not verified as accurate and actual prices may vary from those shown on the Sites.",
        ],
      },
      {
        kind: "para",
        content: [
          "From time to time, third parties may list promotions, special offers or other forms of coupon on our Sites (“Coupons”). Coupons will contain terms and conditions that will apply in addition to these Terms, and will be void if you attempt to redeem the Coupon in violation of either these Terms or the terms of the Coupon. Unless expressly stated on the Coupon, it may not be used in combination with other promotions or discounts. Coupons are only redeemable during the promotional period specified in the Coupon, subject to availability. These Coupons will be non-transferable and have no alternative cash value.",
        ],
      },
    ],
  },
  {
    title: "Payments",
    blocks: [
      {
        kind: "para",
        content: [
          "In some circumstances, you can make payments to Advertisers via our Sites using payment provider such as Stripe You can find out more about Stripe ",
          { text: "here", href: "https://stripe.com/gb/customers", newTab: true },
          ". In such circumstances, it remains your responsibility to make yourself aware of the Advertiser’s booking and cancellation policies. Any deposit paid to an Advertiser via our Sites is held by the Advertiser not by amberstudent.com. At the end of a tenancy agreement, you must contact the Advertiser to obtain the return of your Deposit.",
        ],
      },
    ],
  },
  {
    title: "Changes and cancellation",
    blocks: [
      {
        kind: "para",
        content: [
          "Any tenancy agreement entered into will be between a Student and an Advertiser. It is a Student’s responsibility to make themselves aware of the Advertiser’s cancellation policy at the time of booking.",
        ],
      },
    ],
  },
  {
    title: "Intellectual property rights",
    blocks: [
      {
        kind: "para",
        content: [
          "We are the owner or the licensee of all intellectual property rights in our Sites, and in the material published on it. Those works are protected by copyright laws and treaties (and/or similar intellectual property laws, as relevant) around the world. All such rights are reserved.",
        ],
      },
    ],
  },
  {
    title: "Linking to our Sites",
    blocks: [
      {
        kind: "para",
        content: [
          "You may link to our home pages, provided you do so in a way that is fair and legal and does not damage our reputation or take advantage of it.",
        ],
      },
      {
        kind: "para",
        content: [
          "You must not establish a link in such a way as to suggest any form of association, approval or endorsement on our part where none exists.",
        ],
      },
      {
        kind: "para",
        content: ["You must not establish a link to our Sites in any website that is not owned by you."],
      },
      {
        kind: "para",
        content: [
          "Our Sites must not be framed on any other site, nor may you create a link to any part of our Sites other than the home pages.",
        ],
      },
      {
        kind: "para",
        content: ["We reserve the right to withdraw linking permission without notice."],
      },
      {
        kind: "para",
        content: [
          "If you wish to make any use of content on our Sites other than that set out above, please contact ",
          EMAIL,
          ".",
        ],
      },
    ],
  },
  {
    title: "Third party links and resources on our Sites",
    blocks: [
      {
        kind: "para",
        content: [
          "Where our Sites contain links to other sites and resources provided by third parties, these links are provided for your information only.",
        ],
      },
      {
        kind: "para",
        content: [
          "Any maps provided on our Sites that are provided by Google are subject to the current terms and conditions published by Google available at:",
        ],
      },
      {
        kind: "para",
        content: [
          {
            text: "http://www.google.com/intl/en/help/terms_maps.html",
            href: "http://www.google.com/intl/en/help/terms_maps.html",
            newTab: true,
          },
          " and ",
          {
            text: "https://developers.google.com/maps/terms",
            href: "https://developers.google.com/maps/terms",
            newTab: true,
          },
          ".",
        ],
      },
      { kind: "para", content: ["We have no control over the contents of those sites or resources."] },
    ],
  },
  {
    title: "Changes to the terms",
    blocks: [
      {
        kind: "para",
        content: [
          "We may revise these terms at any time by amending this page. We will use appropriate means, such as relevant announcements on our homepage, to inform you on such amendments. If you do not agree with the changes, you must stop using the Sites.",
        ],
      },
    ],
  },
  {
    title: "Applicable Law",
    blocks: [
      {
        kind: "para",
        content: [
          "If you are a consumer, please note that these terms of use, their subject matter and their formation, are governed by English law and you and we both agree that the courts of England and Wales will have non-exclusive jurisdiction, however nothing in this clause 13 shall prevent you from being able to bring a claim in the courts of your country of residence under the applicable laws of your country of residence in situations where your right to do so is mandatory under applicable local law.",
        ],
      },
    ],
  },
  {
    title: "Information given by you",
    blocks: [
      {
        kind: "para",
        content: [
          "You can give us the information by filling the request form at amber, over call, email or at various offline promotional events. The informational you give us may include your name, phone number, email id. For booking your accommodation at amber you may need to give further personal information (ex. Birth date, country of origin, guarantor’s details, University name etc) on call or email or other messaging services as necessary.",
        ],
      },
    ],
  },
  {
    title: "Consent to Personal Data Collection & Processing",
    blocks: [
      {
        kind: "para",
        content: [
          "By using our services, you consent to the collection, processing, storage, and transfer of your personal data as described in our Privacy Policy. We process your information to provide and improve our services, communicate with you, and complete your accommodation bookings. We may share your data with trusted partners only as necessary for these purposes. You acknowledge that you have read and agree to our Privacy Policy and Terms of Use, and that you may withdraw consent or exercise your data rights at any time as permitted under applicable data-protection laws, including GDPR.",
        ],
      },
    ],
  },
  {
    title: "Service Fee - Refund Policy",
    blocks: [
      {
        kind: "para",
        content: [
          "The Service Fee paid by the student at the time of initiating a booking request shall be strictly non-refundable under any and all circumstances, with the sole exception being a case where amber is unable to secure the specific room category at the selected property as explicitly requested by the student during the time of booking. The non-refundable nature of the Service Fee shall apply irrespective of the reason for cancellation initiated by the student after the Service Fee has been remitted. This includes, but is not limited to, changes in travel plans, visa rejections, admission withdrawals, personal emergencies, or any other unforeseen or unavoidable circumstances that may arise. amber invests significant resources and undertakes operational efforts upon receiving a booking request, including engaging with property partners, initiating reservation processes, and providing support services. Accordingly, the Service Fee is charged as a one-time commitment fee to cover these efforts and ensure priority handling of the student’s booking. By proceeding with the payment of the Service Fee, the student expressly acknowledges and agrees to the terms of this refund policy and waives any claim for a refund except in the aforementioned case of non-availability of the requested room category.",
        ],
      },
    ],
  },
];

const TERMS_CONTENT: LegalDocContent = {
  lead: "Terms and conditions of website use",
  intro: INTRO,
  callout: CALLOUT,
  sections: SECTIONS,
};

export default TERMS_CONTENT;
