/*
    HtmlBlock is a parser for a html elements and attributes
*/

import { Block } from "./Block";
import { IBlock } from "./types";

interface IHtmlOptions {}
class HtmlBlock extends Block<IHtmlOptions> {
    constructor(options: IBlock<IHtmlOptions>) {
        super(options);
    }
}
