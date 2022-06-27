/**
 * Copyright (C) 2022 Duck McSouls
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

// FIXME: This is an early version.  Needs some optimization to output shorter
//        encoded strings.

import { assert } from "./libbnr.js";

/**
 * Handle the case where the search buffer (i.e. the sliding window) does not contain
 * the character S[i].
 *
 * @param data The input string to be compressed.  Cannot be an empty string.
 * @param i All characters from index i onward are yet to be processed.
 * @param chunk_type The format of the latest chunk.
 * @return An array [chunk, ctype, k] as follows.
 *     (1) chunk := An array of one or more chunks.  These chunks are compressed
 *         versions of a number of characters from index i onward.
 *     (2) ctype := The format of the last chunk in the chunk array.
 *     (3) k := Start our further processing from this index onward.
 */
function buffer_excludes_Si(data, i, chunk_type) {
    // The first chunk type, which follows the format L<string>.
    const STRING = 1;
    // The second chunk type, following the format LX.
    const DIGIT = 2;
    assert(data.length > 0);
    assert(i >= 0);
    assert(i < data.length);
    assert((STRING == chunk_type) || (DIGIT == chunk_type));
    // The search buffer does not include the character S[i].  It would not help
    // us to look ahead to the character at index i+1.  Suppose we look ahead
    // and consider the substring S[i...i+1].  Our updated search buffer is
    // S[i-8, i-7, ..., i-1, i].  Since S[i] is not found in the search buffer
    // S[i-9, i-8, i-7, ..., i-1], the substring S[i...i+1] is also not contained
    // in the updated search buffer.  The way we compress S[i], and possibly
    // S[i+1...i+8], depends on the format of the latest chunk.
    if (DIGIT == chunk_type) {
        // Try to compress the new chunk along the format L<string>.  Possibilities
        // to consider.
        // (1) The substring S[i...i+j] is composed of the same character, where
        //     0 < j < 9.
        // (2) Consider the substring S[i...] and treat it as if we are constructing
        //     an early search buffer to bootstrap the compression process.
        // Let's consider the first possibility.
        let [str, j] = longest_run_char(data, i);
        assert(str.length <= 9);
        if (str.length > 1) {
            // From index i onward, we can find a substring of length at least 2.
            // Furthermore, all characters in the substring are the same.  We output
            // two chunks:
            //
            // 1<c> L1
            //
            // which have the following interpretation:
            //
            // (1) 1 := The decimal digit for one.
            // (2) <c> := The character data[i].
            // (3) L := The length of str minus 1.  We have already compressed one
            //     character from str, hence the chunk 1<c>.
            const ell = str.length - 1;
            const chunka = "1" + str[0];
            const chunkb = ell + "1";
            return [[chunka, chunkb], DIGIT, j];
        }
        // The second possibility is that the characters S[i] and S[i+1] are different.
        // Consider the substring T consisting of characters from index i onward.  Use
        // T to construct a (part of a) search buffer.  Output the chunk L<string>.
        [str, j] = build_buffer(data, i);
        const ell = str.length;
        const chunk = ell + str;
        return [[chunk], STRING, j];
    }
    // The latest chunk follows the format L<string>.
    assert(STRING == chunk_type);
    // The character data[i] is not contained in the search buffer.  Our new chunk
    // cannot take the format LX.  We must output two chunks:
    //
    // 0 L<string>
    //
    // Consider the substring T consistings of characters from index i onward.
    // Use T to construct a (part of a) search.  Then output two chunks
    // following the format "0 L<string>".
    const [str, j] = build_buffer(data, i);
    const ell = str.length;
    const chunka = "0";
    const chunkb = ell + str;
    return [[chunka, chunkb], STRING, j];
}

/**
 * Handle the case where the search buffer (i.e. the sliding window) contains the character S[i].
 *
 * @param data The input string to be compressed.  Cannot be an empty string.
 * @param i All characters from index i onward are yet to be processed.  As the character S[i] is
 *     found in the sliding window, then sliding window must have at least 1 character.  Therefore
 *     we have i > 0.
 * @param chunk_type The format of the latest chunk.
 * @return An array [chunk, ctype, k] as follows.
 *     (1) chunk := An array of one or more chunks.  These chunks are compressed
 *         versions of a number of characters from index i onward.
 *     (2) ctype := The format of the last chunk in the chunk array.
 *     (3) k := Start our further processing from this index onward.
 */
function buffer_includes_Si(data, i, chunk_type) {
    // The first chunk type, which follows the format L<string>.
    const STRING = 1;
    // The second chunk type, following the format LX.
    const DIGIT = 2;
    assert(data.length > 0);
    assert(i > 0);
    assert(i < data.length);
    assert((STRING == chunk_type) || (DIGIT == chunk_type));
    // Starting from index i, find the longest string that is contained in the sliding window.
    // As we append another character to the string, the sliding window shifts by one
    // character to the right.  Note that the sliding window has at most 9 characters, as is
    // the string were are trying to build.  In other words, we can look back to 9 characters
    // and look ahead to 9 characters.
    const max = 9;
    let widx = Math.max(0, i - max);
    let window = data.slice(widx, i);
    assert(window.includes(data[i]));
    // Starting from index i and counting down, how many characters must we backtrack to find S[i]?
    const b = window.length - window.lastIndexOf(data[i]);
    // Start building the string.
    const upper = i + max;
    let str = data[i];
    for (let idx = i + 1; idx < upper; idx++) {
        if (!window.includes(str + data[idx])) {
            break;
        }
        str = str.concat(data[idx]);
        widx = Math.max(0, idx - max);
        window = data.slice(widx, idx);
    }
    // The string should have at most 9 characters.
    assert(str.length > 0);
    assert(str.length <= max);
    // If the string has 9 characters, then we are done.  If the string has at most 8 characters,
    // then the next character should not be found in the sliding window.  In either case, we
    // now compress the string.
    if (STRING == chunk_type) {
        // The latest chunk was compressed by using the format L<string>.  Now use the format LX.
        // The format LX is perfect for the current situation because the string is contained in
        // a sliding window.  We let L be the length of the string.  The value of X is defined as
        // the number of characters we must backtrack to find that our string matches a substring
        // of the sliding window.
        const L = str.length;
        const X = b;
        const k = i + L;
        const chunk = L + "" + X;
        return [[chunk], DIGIT, k];
    }
    // The latest chunk was compressed by using the format LX.  Now switch to the format L<string>.
    // Consider the following cases:
    // (1) The string has exactly one character.  Use the format L<string> to compress the string.
    // (2) The string has two characters.  Use the format L<string> to compress the string.
    // (3) The string has at least three characters.  It does not make sense to use the format
    //     L<string> to compress the string.  The reason is that the resulting chunk would have
    //     1 + k characters, where k is the number of characters in the string.  Instead, we should
    //     use the format "0 LX", where "0" means we switch off the string format L<string> and now
    //     proceed to use the digit format LX.
    assert(DIGIT == chunk_type);
    const L = str.length;
    const k = i + L;
    if (str.length < 3) {
        const chunk = L + str;
        return [[chunk], STRING, k];
    }
    const X = b;
    const chunka = "0";
    const chunkb = L + "" + X;
    return [[chunka, chunkb], DIGIT, k];
}

/**
 * FIXME: When building a buffer, take care that the sliding window has length at most 9.
 *
 * Build a whole search buffer or part of the buffer.  We must have a non-empty search buffer
 * prior to starting the general case of the compression process.
 *
 * @param data We want to compress this string.  Cannot be an empty string.
 * @param i Start searching from this index in the input string.
 * @return An array [S, k] as follows.
 *     (1) S := A string representing a search buffer or part of a search buffer.
 *     (2) k := The length of the string S plus i.  The value of k is the index into the
 *         input string such that all characters with indices less than k have been
 *         processed.  If S contains the remaining characters of the input string, then k
 *         is at least the length of the input string.
 */
function build_buffer(data, i) {
    // Sanity checks.
    assert(data.length > 0);
    assert(i >= 0);
    assert(i < data.length);
    // Let the input string be S.  Construct the longest substring S[i...j] such that
    // each character in the substring is not found in the sliding window.  Due to the format
    // of each compressed chunk, the substring is limited to a length of at most 9.  The
    // sliding window initially includes the 9 consecutive characters immediately before
    // the character at index i, i.e. the substring S[i-9, i-8, i-7, ..., i-1].
    let buffer = "";
    const max = 9;
    const upper = Math.min(i + max, data.length);
    // If i - max < 0, choose 0.
    // If i - max = 0, choose 0.
    // If i - max > 0, choose i - max.
    // If i = 0, then the sliding window is initially an empty string.
    let widx = Math.max(0, i - max);
    let window = data.slice(widx, i);
    for (let idx = i; idx < upper; idx++) {
        if (window.includes(data[idx])) {
            break;
        }
        // Add the unique character data[idx] to our buffer.  Shift the sliding window one
        // character to the right.
        buffer = buffer.concat(data[idx]);
        widx = Math.max(0, idx - max);
        window = data.slice(widx, idx + 1);
    }
    // The buffer should now have length at most 9.  If the buffer has length 9, we take
    // this to be our search buffer.
    assert(buffer.length > 0);
    assert(buffer.length <= max);
    if (max == buffer.length) {
        return [buffer, i + buffer.length];
    }
    // The buffer S[i...j] has a length of at most 8.  Suppose 0 <= i < j < i + 8.
    assert(buffer.length < max);
    // If j = i + 7, the substring has 8 characters.  It does not matter whether the
    // character S[j+1] can be found in the substring S[i...j].  We simply extend the
    // substring to include the character S[j+1] and let S[i...j+1] be part of our
    // search buffer.
    if (buffer.length == (max - 1)) {
        // No more characters in the input string for us to look ahead.
        const k = buffer.length + i;
        if (k >= data.length) {
            return [buffer, k];
        }
        // We can look ahead to the next character.
        buffer = buffer.concat(data[k]);
        assert((k + 1) == (i + buffer.length));
        return [buffer, k + 1];
    }
    // If j < i + 7, the substring S[i...j] has at most 7 characters.  Look ahead to the
    // next character S[j+1].  We have two possibilities:
    //
    // (1) S[j+1] is different from any of the characters in S[i...j].
    // (2) S[j+1] can be found in S[i...j].
    assert(buffer.length < (max - 1));
    const j = buffer.length + i;
    if (j >= data.length) {
        // There are no more characters in the input string for us to look ahead.
        return [buffer, j];
    }
    const c = data[j];
    // The character c is not found in the sliding window.  Append c to our buffer and
    // take the updated buffer as (part of) our search buffer.
    if (!window.includes(c)) {
        buffer = buffer.concat(c);
        return [buffer, i + buffer.length];
    }
    // The character S[j+1] can be found in S[i...j].  Look ahead to the character S[j+2].
    // If the substring S[j+1...j+2] is not found in the sliding window, we enlarge S[i...j]
    // to include the character S[j+1] and take S[i...j+1] as (part of) our search buffer.
    // However, suppose S[j+1...j+2] can be found in the sliding window.  Then take
    // S[i...j] as (part of) our search buffer.
    assert(window.includes(c));
    const k = j + 1;
    const bufferc = buffer.concat(c);
    if (k >= data.length) {
        // There are no more characters in the input string for us to look ahead.
        return [bufferc, k];
    }
    const str = c + data[k];
    widx = Math.max(0, k - max);
    const windowc = data.slice(widx, k);
    if (windowc.includes(str)) {
        return [buffer, j];
    }
    return [bufferc, k];
}

/**
 * Use a variant of the Lempel-Ziv (LZ) algorithm to compress a string.
 *
 * === Decompression ===
 *
 * The compressed string follows the format
 *
 * C_1 C_2 C_3 ... C_n
 *
 * where C_i is the i-th chunk of the compressed data.  Each chunk has two parts:
 *
 * (1) L := The length of an uncompressed portion of data.  The length L is an
 *     integer between 1 and 9, inclusive.  The length number is the first part
 *     of any chunk.
 * (2) data := The chunk data, which is the second part of any chunk.  The
 *     chunk data can be further decomposed into two types:
 *     (a) Literal characters.  A chunk with this second part is denoted as
 *         "L<string>", where <string> a string of L characters.  We append
 *         these L characters directly into the uncompressed string.  For
 *         example, given the chunk "3abc", the digit "3" is the first part of
 *         the chunk and the string "abc" is the second part.  The length 3,
 *         together with the string, tells us to copy the first 3 characters of
 *         the string and append the characters to the uncompressed data.  That
 *         is, we append the string "abc" to our uncompressed data.
 *     (b) An ASCII digit X.  A chunk having this second part is denoted as
 *         "LX", where X is a decimal digit between 1 and 9, inclusive.  The
 *         value of X tells us how many characters in the uncompressed string
 *         to backtrack.  Going from right to left in the uncompressed string,
 *         we traverse X locations, copy the character at the X-th location,
 *         and append the character to our uncompressed string.  Repeat the
 *         process as many times as necessary until we have appended L
 *         characters.  For example, suppose we have the chunk "53" and our
 *         (still incomplete) uncompressed string is "abcd".  The first part
 *         "5" tells us how many characters to append to the uncompressed
 *         string.  The second part "3" tells us to backtrack 3 positions in
 *         the uncompressed string to locate the character to copy and append.
 *         Here's how to obtain the first character to append.  Going from
 *         right to left in the uncompressed string "abcd", we backtrack to the
 *         3rd character, namely "b".  We copy this character and append it to
 *         our uncompressed string, resulting in the new uncompressed string
 *         "abcdb".  One down, four to go.  For our second character, we
 *         backtrack 3 locations in the uncompressed string "abcdb" to arrive
 *         at "c".  Copy and append this character to produce the new
 *         uncompressed string "abcdbc".  Two down, three to go.  The third
 *         character to copy and append is "d", resulting in the uncompressed
 *         string "abcdbcd".  The fourth character we want is "b" and we now
 *         hhave the uncompressed string "abcdbcdb".  Our fifth character is
 *         "c" and our uncompressed string is "abcdbcdbc".
 *
 * The chunk type alternates and we always start with a chunk of the type
 * "L<string>".  The compressed data follows the format
 *
 * L<string> LX L<string> LX ...
 *
 * If L:= 0, the chunk ends immediately and we start a new chunk of the type
 * different from the previous type.  A portion of the compressed data might be
 *
 * ... L<string> 0 L<string> ...
 *
 * or, as another example,
 *
 * ... LX 0 LX ...
 *
 * The above rules help us to make sense of the compressed data "312312021".
 * We have these chunks: "3123", "12", "0", "21".  The uncompressed string is
 * "123222".
 *
 * === Compression ===
 *
 * The above easily translates to an algorithm for decompression.  We now want
 * an algorithm for compression.  The original LZ compression algorithm, as
 * described by Ziv and Lempel in 1977, partitions the input string into two
 * non-overlapping parts.  The left part is called the "search buffer".  We have
 * processed every character in this portion of the input string.  The right
 * part is called the "look ahead".  We still need to process characters in this
 * segment of the input string.  At any stage in the compression process, the
 * input string can be visualized as follows:
 *
 * -----------------  --------------
 * | Search buffer |  | Look ahead |
 * -----------------  --------------
 *
 * Consider the early stage of the compression process.  Let S be our input string.
 * We start at the character S[0].  Our search buffer is empty.  Does this mean we
 * compress S[0] as 0?  No.  In the early stage of the compression process, we must
 * construct an early search buffer, a process equivalent to constructing a string
 * chunk.  Refer to the string_chunk() function for more details.  We compress our
 * early search buffer S[0...k-1] by using the chunk format L<string>, where L := k
 * and <string> := S[0...k-1].
 *
 * Let's proceed with the general case of the compression algorithm.  Suppose we have
 * compressed the input string S up to and including the character at index i-1, i.e.
 * the substring S[0...i-1] has been compressed, possibly as multiple chunks.  Our
 * search buffer is the substring S[i-9, i-8, i-7, ..., i-1] and we need to process
 * characters from index i onward.  We look ahead to the character at index i.  An
 * important question is:
 *
 * [?] Is the substring S[i] contained in the search buffer?
 *
 * We have two possibilities:
 *
 * (1) The substring S[i] is contained in the search buffer.  Look ahead to the next
 *     character at index i+1 and consider the substring S[i...i+1].  Is the
 *     substring S[i...i+1] contained in the updated search buffer
 *     S[i-8, i-7, ..., i-1, i]?  Note that we have enlarged the search buffer by one
 *     character to include the character S[i].  Consider the following cases:
 *     (a) The substring S[i...i+1] is contained in the search buffer
 *         S[i-8, i-7, ..., i-1, i].  Below we will discuss the general case of the
 *         compression algorithm, where we start with a substring of two or more
 *         characters that can be found in a search buffer.
 *     (b) The substring S[i...i+1] is not found in the search buffer
 *         S[i-8, i-7, ..., i-1, i].  Compress the character S[i].
 *         (i) If the previous chunk follows the format L<string>, then compress S[i]
 *             by using the format LX.
 *         (ii) If the previous chunk follows the format LX, then compress S[i] by
 *             using the format L<string>.
 * (2) The substring S[i] is not found in the search buffer.  Looking ahead does not
 *     help us to extend S[i] to have two characters, because the substring S[i...i+1]
 *     would still not be found in the updated search buffer.  We are forced to compress
 *     the single character S[i], the chunk format being dependent on the format of the
 *     previous chunk.
 *     (a) Suppose the previous chunk follows the format L<string>.  The current chunk
 *         should follow the format LX.  However, the chunk format LX applies whenever
 *         a substring starting from index i can be located in a search buffer.  As S[i]
 *         is not found in the search buffer, it does not make sense to use the chunk
 *         format LX to compress S[i].  A reasonable alternative is to have two chunks
 *         along the format "0 L<string>".  The decimal digit "0" tells the decompression
 *         algorithm to switch off from the LX format and interpret the upcoming chunk
 *         by using the format L<string>.  We start from index i and try to build a
 *         substring that can be compressed along the format L<string>.  Refer to the
 *         string_chunk() function for more details.
 *     (b) The previous chunk has the format LX.  The current chunk must follow the format
 *         L<string>.  Build a substring starting from index i and compress the substring
 *         via the format L<string>.  Refer to the string_chunk() function for more details.
 *
 * In general, suppose the substring S[i...k] can be found in a search buffer, where
 * 0 < i < k so the substring has at least 2 characters.  Look ahead to the next character
 * and consider the substring S[i...k+1].  Two possibilities arise.
 *
 * (1) The substring S[i...k+1] is contained in a search buffer.  Look ahead to the next
 *     character at index k+2.
 * (2) The substring S[i...k+1] is not found in a search buffer.  Compress the substring
 *     S[i...k].
 *
 * How are we to compress the substring S[i...k]?  All characters in the substring
 * S[0...i-1] have been compressed (using one or more chunks) so we already have at least
 * one compressed chunk.  Recall that each chunk must follow one of two formats as described
 * above.  We consider two cases:
 *
 * (1) Suppose the latest chunk follows the format L<string>.  The substring S[i...k] must be
 *     compressed using the format LX.  By assumption, S[i...k] is found in a search buffer,
 *     hence the format LX is perfect for the situation.
 * (2) The latest chunk follows the format LX.  The substring S[i...k] must be compressed by
 *     using the format L<string>, but this is non-sensical.  The substring S[i...k] can be
 *     found in a search buffer, meaning that the format LX would result in a possibly shorter
 *     chunk than if we use the format L<string>.  We use the format "0 LX" to tell the
 *     decompression algorithm to skip the format L<string> and treat the upcoming chunk by
 *     using the format LX.  The exception is when k = i+1, i.e. the substring has two
 *     characters.  If we use the format L<string>, then we have the chunk "2ab" where the
 *     character a := c_i is found at index i and b := c_{i+1} is found at index i+1.  If we
 *     use the format "0 LX", then we have the two chunks "0 2X".  In both cases, the
 *     substring S[i...i+1] is compressed using the same number of encoding characters.
 *
 * As described in the decompression algorithm, the value of L is restricted to the
 * decimal digits between 1 and 9, inclusive.  Furthermore, X represents a decimal
 * digit between 1 and 9, inclusive.  The limitations on the values of L and X
 * imply that our search buffer does not necessarily extend all the way to the first
 * character of the input string.  Think of our search buffer as a sliding window,
 * where the length of the window is at most 9.  If the early search buffer has 9
 * characters, then starting from index i := 9 onward our search buffer is a sliding
 * window of 9 characters wide.  In case the early search buffer has less than 9
 * characters, we proceed with the general compression algorithm, extending our
 * early search buffer one character at a time until we have processed at least 9
 * characters.  Suppose we have processed k >= 9 characters.  The character at index
 * k is yet to be processed.  Our search buffer is the sliding window
 * S[k-9, k-8, k-7, ..., k-1].
 *
 * Refer to the following for more details:
 *
 * [1] J. Ziv and A. Lempel.  A universal algorithm for sequential data
 *     compression.  IEEE Transactions on Information Theory, volume 23, issue 3,
 *     pp.337--343, 1977.
 *     DOI: 10.1109/TIT.1977.1055714
 * [2] Colt McAnlis and Aleks Haecky.  Understanding Compression: Data Compression
 *     for Modern Developers.  O'Reilly, 2016.
 * [3] The Hitchhiker's Guide to Compression
 *     https://go-compression.github.io/
 *
 * @param data We want to compress this string.  Cannot be an empty string.
 * @return The compressed string corresponding to the input data.
 */
function compress(data) {
    assert(data.length > 0);
    // Construct our early search buffer and compress it as our very first chunk.
    // The very first chunk follows the format L<string>.
    let [buffer, i] = build_buffer(data, 0);
    let L = buffer.length;
    const chunk = new Array();
    chunk.push(L + buffer);
    // Proceed with the general compression algorithm.
    // The first chunk type, which follows the format L<string>.
    const STRING = 1;
    // The second chunk type, following the format LX.
    const DIGIT = 2;
    // The length of the sliding window.  This is the maximum number of characters
    // in our search buffer.
    const wlength = 9;
    // The format of the latest chunk.  Alternate between the chunk types.  We
    // always start with chunk type 1.
    let chunk_type = STRING;
    while (i < data.length) {
        // All characters with index less than i have been processed.  Start with
        // the character at index i and look ahead.
        let array;
        let ctype;
        let k;
        if (buffer.includes(data[i])) {
            [array, ctype, k] = buffer_includes_Si(data, i, chunk_type);
        } else {
            [array, ctype, k] = buffer_excludes_Si(data, i, chunk_type);
        }
        // Update our array of chunks, our sliding window, and the index at which to
        // start processing characters.
        for (const c of array) {
            chunk.push(c);
        }
        chunk_type = ctype;
        const widx = Math.max(0, k - wlength);
        buffer = data.slice(widx, k);
        i = k;
    }
    return chunk.join("");
}

/**
 * The longest substring that consists of the same character.
 *
 * @param data Search this string.  Cannot be an empty string.
 * @param i Start our search from this index.  Must be a valid
 *     index into the input string.
 * @return An array [S, j] as follows:
 *     (1) S := A substring of the given input string.  The substring has
 *         length at least 2 and at most 9.  All characters in the substring
 *         are the same.  Return an empty string if no such substring can be found.
 *     (2) j := The index immediately after the last character in S.  The character
 *         data[j-1] is the last to be in S, whereas data[j] is not included in
 *         S regardless of whether data[j] can be found in S.  Why?  Suppose S has
 *         a length of 9 characters, all of which are the same character.  If
 *         data[j] is the same character as any in S, we cannot extend S to have
 *         another character because the length of S would then exceed 9.  Return
 *         i if S is an empty string.
 */
function longest_run_char(data, i) {
    // Sanity checks.
    assert(data.length > 0);
    assert(i >= 0);
    assert(i < data.length);
    // Cannot find a substring composed of the same character.  Must look
    // ahead at the character at index i+1.
    const lastidx = data.length - 1;
    const empty_str = "";
    if (lastidx == i) {
        return [empty_str, i];
    }
    if (data[i] != data[i + 1]) {
        return [empty_str, i];
    }
    // We have a substring of length at least 2, where all characters in the
    // substring are the same.  Determine whether we can extend this substring.
    // Starting from i, we can only look ahead to at most another 8 characters.
    const max = i + 9;
    let j = i + 1;
    while ((data[i] == data[j]) && (j < max)) {
        j++;
    }
    const str = data.slice(i, j);
    // Sanity check.
    assert(str.length > 1);
    assert(str.length <= 9);
    if (str.length < 9) {
        assert(str[0] != data[j]);
    }
    return [str, j];
}

/**
 * Compression II: LZ Decompression: Lempel-Ziv (LZ) compression is a data
 * compression technique that encodes data using references to earlier parts of
 * the data.  In this variant of LZ, data is encoded as two types of chunk.
 * Each chunk begins with a length L, encoded as a single ASCII digit from 1 to
 * 9, followed by the chunk data, which is either:
 *
 * 1. Exactly L characters, which are to be copied directly into the
 *    uncompressed data.
 * 2. A reference to an earlier part of the uncompressed data.  To do this, the
 *    length is followed by a second ASCII digit X.  Each of the L output
 *    characters is a copy of the character X places before it in the
 *    uncompressed data.
 *
 * For both chunk types, a length of 0 instead means the chunk ends
 * immediately, and the next character is the start of a new chunk.  The two
 * chunk types alternate, starting with type 1, and the final chunk may be of
 * either type.  You are given a string as input.  Encode it using Lempel-Ziv
 * encoding with the minimum possible output length.
 *
 * Usage: run lzc.js [cct] [hostname]
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    const data = [
        "abracadabra",
        "mississippi",
        "aAAaAAaAaAA",
        "2718281828",
        "abcdefghijk",
        "aaaaaaaaaaaa",
        "aaaaaaaaaaaaa",
        "aaaaaaaaaaaaaa",
    ];
    for (let i = 0; i < data.length; i++) {
        ns.tprint(data[i] + " -> " + compress(data[i]));
    }
}
