# Stock Market

The
[Stock Market](https://bitburner-official.readthedocs.io/en/latest/basicgameplay/stockmarket.html)
can be a good source of passive income. Depending on how you use it, the Stock
Market can be your personal bank where profits you earn are like interest on
your deposit. To start trading on the Stock Market, you must have an account on
the World Stock Exchange (WSE). Like The Slums, the WSE is available in each
city. Refer to the image below to help you locate the WSE. Click on the dollar
sign icon `$` to load the page for the WSE. As the goal of this guide is to help
you automate as many aspects of the game as possible, the guide will not discuss
manual trading on the Stock Market.

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

> **Problem 1.** Obtain access to all WSE APIs and data. Write a trade bot to
> automate your trading on the Stock Market. For your first trade bot, buy a
> certain number of shares of a stock if you have sufficient funds. Make sure
> not to use all your money to buy shares. Furthermore, sell all shares of a
> stock provided that you can make a profit from the sale.
>
> **Problem 2.** The functions
> [`ns.grow()`](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.grow.md),
> [`ns.hack()`](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.hack.md),
> and
> [`ns.weaken()`](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.weaken.md)
> each has an option that allows you to affect the Stock Market. Modify your
> hack script to affect the Stock Market.
>
> **Problem 3.** Using the modified hack script from the previous exercise,
> every time the script hack/grow/weaken a world server the action would
> somewhat affect the stock of the company/organization that owns the server.
> Use this to your advantage by having each purchased server target a different
> world server. Use the weight function from the subsection
> [Your first worm](reboot.md#your-first-worm) to help you choose a bunch of
> world servers for your pserv farm to target.

[[TOC](README.md "Table of Contents")]
[[Previous](faction.md "Faction progression")]
[[Next](misc.md "Miscellaneous topics")]

[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-blue.svg)](http://creativecommons.org/licenses/by-nc-sa/4.0/)
