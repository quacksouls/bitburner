# Stocks and contracts

Your Hacknet farm and server hacking can quickly generate a large amount of
passive income. In this section, you will explore two game mechanics that can
provide a huge sum of money in a relatively short amount of time.

## Stock Market

The
[Stock Market](https://bitburner.readthedocs.io/en/latest/basicgameplay/stockmarket.html)
can be a good source of passive income. Depending on how you use it, the Stock
Market can be your personal bank where profits you earn are like interest on
your deposit. To start trading on the Stock Market, you must have an account on
the World Stock Exchange (WSE). Like The Slums, the WSE is available in each
city. Refer to the image below to help you locate the WSE. Click on the dollar
sign icon `$` to load the page for the WSE. As the ultimate goal of this guide
is to help you automate as many aspects of the game as possible, the guide will
not discuss manual trading on the Stock Market.

![World Stock Exchange](image/stock-market.png "World Stock Exchange")

Use the
[Stock Market API](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.tix.md)
to automate your trading. Note that the namespace of the API is
`ns.stock.functionName()`, not `ns.TIX.functionName()`. Automatic trading on the
Stock Market requires a huge initial cost. First, you must spend $200m to
purchase an account on the WSE. The account gives you access to manual trading,
i.e. you must point and click to trade a stock. For an extra $5b, you can
purchase access to the Trade Information eXchange (TIX) API, which allows you to
automate various aspects of your trading on the Stock Market. Spend another $25b
to purchase access to the 4S Market Data TIX API. An extra $1b would buy you
access to the 4S Market Data. Every transaction you make through 4S incurs a
commission fee of $100k. In total, expect to pay $31.2b up front to have access
to all APIs and data relevant to the Stock Market. Your access to the APIs and
data is permanent and do not reset after installing an Augmentation. Despite the
huge initial cost, in the long run trading on the Stock Market can reward you
with much more passive income than the combination of your Hacknet and server
hacking. Every time you trade on the Stock Market, ensure you leave some money
in reserve in case you need money to purchase servers or upgrade your Hacknet
nodes. Refrain from spending all your money gambling on the Stock Market.

> **Problem.** Obtain access to all WSE APIs and data. Write a trade bot to
> automate your trading on the Stock Market. For your first trade bot, buy a
> certain number of shares of a stock if you have sufficient funds. Make sure
> not to use all your money to buy shares. Furthermore, sell all shares of a
> stock provided that you can make a profit from the sale.

## Coding Contracts

[Coding Contracts](https://bitburner.readthedocs.io/en/latest/basicgameplay/codingcontracts.html)
(or CCT) are programming problems. Every 10 minutes there is 25% chance for a
CCT to spawn on a random world server. Correctly solving a CCT would grant you a
random reward. The reward can be faction reputation, company reputation, or
money. Early in the game, the money you gain from a CCT is immensely useful to
help you upgrade the `home` server, purchase servers, or buy programs via the
dark web. Use the
[CCT API](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.codingcontract.md)
to help you automate various aspects of this game mechanic. The namespace of the
API is `ns.codingcontract.functionName()`, not
`ns.CodingContract.functionName()`. Here is a list of CCT problems:

1. _Find Largest Prime Factor._ Determine the largest prime factor of an
   integer. The problem boils down to obtaining the
   [prime factorization](https://en.wikipedia.org/wiki/Integer_factorization) of
   an integer.
1. _Subarray with Maximum Sum._ This is the
   [maximum subarray problem](https://en.wikipedia.org/wiki/Maximum_subarray_problem),
   where empty subarrays are not permitted as solutions. Your task is to
   determine a non-empty, contiguous subarray that has the largest sum and
   output that sum.
1. _Total Ways to Sum._ How many different ways can a positive integer $n$ be
   written as a sum of at least two positive integers? The problem is
   essentially that of determining the
   [partition number](<https://en.wikipedia.org/wiki/Partition_function_(number_theory)>)
   of $n$. You must subtract 1 from the partition number because the partition
   number includes $n$ itself as a solution.
1. _Total Ways to Sum II._ How many ways can an integer be partitioned using
   only numbers from a given array? This is a special case of the previous
   problem.
1. _Spiralize Matrix._ Output the elements of a 2-D matrix in spiral order,
   following clockwise direction. You might find
   [this animation](https://www.educative.io/answers/spiral-matrix-algorithm)
   useful.
1. _Array Jumping Game._ An array has integer elements. Each element specifies
   the maximum number of array cells to jump from that element. Starting from
   the first array cell, determine whether you can reach the last array cell.
1. _Array Jumping Game II._ Same as _Array Jumping Game_, but you must determine
   the minimum number of jumps to reach the end of an array.
1. _Merge Overlapping Intervals._ Merge any overlapping intervals. Output your
   result in ascending order.
1. _Generate IP Addresses._ Given a string of digits, determine all valid IPv4
   addresses.
1. _Algorithmic Stock Trader I._ You have an array $p$ of stock prices, where
   $p_i$ is the price of a stock on day $i$. All prices relate to the same
   stock. Suppose you are allowed one transaction, i.e. you can buy once and
   sell once. Determine the maximum profit you can make.
1. _Algorithmic Stock Trader II._ Given an array of stock prices, determine the
   maximum profit to be made if you are allowed an unlimited number of
   transactions.
1. _Algorithmic Stock Trader III._ Given an array of stock prices, maximize your
   profit but use at most two transactions.
1. _Algorithmic Stock Trader IV._ Given an array of stock prices, maximize your
   profit but use at most $k$ transactions.
1. _Minimum Path Sum in a Triangle._ Descend a triangle of numbers from top to
   bottom, taking a path of minimum sum.
1. _Unique Paths in a Grid I._ Determine the number of unique paths in an
   $m \times n$ grid. You start at the top-left square and find a path to the
   bottom-right square. Each step must be either down or right.
1. _Unique Paths in a Grid II._ Similar to _Unique Paths in a Grid I_, but now
   the grid has a number of obstacles. Calculate the number of paths from the
   top-left square to the bottom-right square. Each path must not pass through
   an obstacle.
1. _Shortest Path in a Grid._ Construct a shortest path from the top-left square
   of a grid to the bottom-right square.
1. _Sanitize Parentheses in Expression._ Remove the minimum number of
   parentheses so that the parentheses in the resulting expression is balanced.
   Multiple solutions are possible.
1. _Find All Valid Math Expressions._ Given a string of decimal digits and a
   target number, determine all valid mathematical expressions, each of which
   evaluates to the given target.
1. _HammingCodes: Integer to Encoded Binary._ Use an extended version of Hamming
   code to encode an integer. The encoded message must have an overall parity
   bit. You might find [this video](https://youtu.be/X8jsijhllIA) useful as well
   as [this animation](https://harryli0088.github.io/hamming-code/), but they
   cover the basic Hamming code not the extended Hamming code required by this
   CCT.
1. _HammingCodes: Encoded Binary to Integer._ Decode a binary string that has
   been encoded using the extended version of Hamming code from the previous
   problem.
1. _Proper 2-Coloring of a Graph._ The problem is equivalent to determining
   whether a graph is
   [bipartite](https://en.wikipedia.org/wiki/Bipartite_graph).
1. _Compression I: RLE Compression._ Determine the
   [run-length encoding](https://en.wikipedia.org/wiki/Run-length_encoding) of a
   string of characters.
1. _Compression II: LZ Decompression._ Use a variant of the Lempel-Ziv algorithm
   to decompress a data string. You might find
   [this video](https://youtu.be/goOa3DGezUA) useful.
1. _Compression III: LZ Compression._ Use a variant of the Lempel-Ziv algorithm
   to compress a data string.
1. _Encryption I: Caesar Cipher._ You are given a string of alphabetic
   characters and an integer $k$ that determines the number of left shifts. Use
   [Caesar cipher](https://en.wikipedia.org/wiki/Caesar_cipher) to encode the
   string with the given left shift value.
1. _Encryption II: Vigenère Cipher._ You are given a string of alphabetic
   characters and a keyword. Use
   [Vigenère cipher](https://en.wikipedia.org/wiki/Vigen%C3%A8re_cipher) and the
   given keyword to encode the string.

> **Problem.** Write a script to help you find CCT on world servers.

[[TOC](README.md "Table of Contents")]
[[Previous](faction.md "Faction progression")]
