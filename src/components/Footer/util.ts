const getSiteNavSchema = (name: string, url: string) => {
  const data = {
    "@context": "https://schema.org",
    "@type": "SiteNavigationElement",
    name,
    url,
  };
  return JSON.stringify(data);
};

export default getSiteNavSchema;
