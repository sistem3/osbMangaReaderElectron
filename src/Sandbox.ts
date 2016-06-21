import {Component} from '@angular/core';
import {bootstrap} from '@angular/platform-browser-dynamic';
import {OsbMangaReader} from 'osb-manga-reader/components';
import { Http, HTTP_PROVIDERS, Headers, RequestOptions } from '@angular/http';

@Component({
    selector: 'wrapper',
    directives: [OsbMangaReader],
    template: `<osb-manga-reader></osb-manga-reader>`
})
export class Wrapper {
    constructor() {
        console.log('Wrapper Loaded');
    }
}

bootstrap(Wrapper, HTTP_PROVIDERS);