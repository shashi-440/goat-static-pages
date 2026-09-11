/**
 * The first word of a person's name, for display.
 *
 * The page stores every person under their full name — that is what the
 * accessible label, the `alt` text and the React key are built from, and what
 * anyone editing the data expects to see. Only the rendered pill is shortened,
 * so shortening happens here at render time rather than in the data.
 *
 * Splitting on whitespace is enough for this dataset: the two entries that are
 * not "First Last" are single names already ("Peter", "Shrey"), which pass
 * through untouched, and "Joey Panithan Ittisan" wants exactly its first word.
 */
const firstName = (name: string): string => name.trim().split(/\s+/)[0] ?? name;

export default firstName;
