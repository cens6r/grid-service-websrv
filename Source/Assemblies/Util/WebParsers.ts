export class PredicateLoaders {
    public static SomePredicate(predicate: (char: string) => boolean, listOfChars: string[]) {
        const len = listOfChars.length;
        for (let i = 0; i < len; i++) {
            if (predicate(listOfChars[i]) === true) {
                return true;
            }
        }
        return false;
    }
}

const Whitespace = [
    ' ',
    '  ',
    '\b',
    '\t',
    '\n',
    '\v',
    '\f',
    '\r',
    `\"`,
    `\'`,
    `\\`,
    '\u0008',
    '\u0009',
    '\u000A',
    '\u000B',
    '\u000C',
    '\u000D',
    '\u0020',
    '\u0022',
    '\u0027',
    '\u005C',
    '\u00A0',
    '\u2028',
    '\u2029',
    '\uFEFF',
];

export class WebParsers {
    public static StripTheTrailingSlash(str: string) {
        return str.replace(/\/$/, '');
    }
    public static SanitizeData(data: any) {
        if (typeof data !== 'string') return null;
        return (data || '').replace(/[^a-z0-9+]+/gi, '');
    }

    public static CheckDoesNumberStringIncludeAlphaChars(input: string | number) {
        if (typeof input === 'number') {
            if (isNaN(input)) return true;
            return false;
        }
        if (!input) return false; // TODO Maybe do some extra response shit here?
        return input.match(/[a-zA-Z]+/g) === null;
    }

    public static CheckDoesStringIncludeASPExtension(str: string) {
        str = str.toLowerCase();
        return str.endsWith('.aspx') || str.endsWith('.ashx') || str.endsWith('.asmx');
    }

    public static CheckDoesStringIncludeInvalidChars(str: string) {
        return str.match(/^[A-Za-z0-9_-]*$/g) === null;
    }

    public static CheckDoesStringIncludeWhitespace(str: string) {
        return PredicateLoaders.SomePredicate((char) => str.indexOf(char) > -1, Whitespace);
    }

    public static CheckIfValueIsIncludedInArray<TValue>(value: TValue, array: TValue[]) {
        return array.indexOf(value) > -1;
    }

    public static CheckIsDateStringAnISODate(str: string) {
        if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(str)) return false;
        var d = new Date(str);
        return d.toISOString() === str;
    }
}
