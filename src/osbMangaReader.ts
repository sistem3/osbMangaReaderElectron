import {Component} from 'angular2/core';

@Component({
    selector: 'osb-manga-reader',
    templateUrl: 'src/osbMangaReader.template.html',
})

export class osbMangaReader {
    isLoading: boolean;
    section: string;
    baseUrl: string;
    defaultSite: string;
    apiKey: string;
    listStyle: boolean;

    mangaDetails: Array;
    mangaInfo: Object;
    mangaChapter: Object;

    siteFavouritesUrl: string;
    siteFavouritesData: Array;
    siteFavouritesDisplay: Array;

    mainListViewData: Array;
    mainListViewDisplay: Array;
    mainListViewDisplayCount: number;

    sliderSettings: Object;

    constructor() {
        this.isLoading = true;
        this.listStyle = false;
        this.section = 'site-favourites';

        this.baseUrl = 'https://doodle-manga-scraper.p.mashape.com/';
        this.apiKey = 'xiQSdA9ACbmshUxnm4ZBC8nn2umSp1LeqQfjsnnVeMWHHSIQy0';
        this.defaultSite = 'mangareader.net';

        this.siteFavouritesUrl = 'http://private-e00abd-osbmangareader.apiary-mock.com/topfeed';
        this.siteFavouritesData = [];
        this.siteFavouritesDisplay = [];

        this.mangaDetails = [];
        this.mangaInfo = {};
        this.mangaChapter = {};

        this.mainListViewData = [];
        this.mainListViewDisplay = [];
        this.mainListViewDisplayCount = 0;

        this.sliderSettings = {
            'slidesPerView': 1,
            'keyboardControl': true,
            'preloadImages': false,
            'lazyLoading': true
        };
        this.checkCache();
        console.log(this);
    };

    checkCache() {
        var mainListData = localStorage.getItem('osbMangaReader.mainList');
        if (mainListData) {
            this.mainListViewData = JSON.parse(mainListData);
        }

        var siteFavourites = localStorage.getItem('osbMangaReader.siteFavourites');
        if (siteFavourites) {
            this.siteFavouritesData = JSON.parse(siteFavourites);
        }

        var mangaDetails = localStorage.getItem('osbMangaReader.mangaDetails');
        if (mangaDetails) {
            this.mangaDetails = JSON.parse(mangaDetails);
        }
        this.getSiteFavourites();
    }

    getSiteFavourites() {
        this.isLoading = true;
        var holder = this;
        holder.siteFavouritesDisplay = [];
        if (holder.siteFavouritesData.length > 1) {
            holder.siteFavouritesData.forEach(function(element) {
                holder.getMangaDetails(element, 'site-favourites', true);
            });

            return false;
        }

        fetch(holder.siteFavouritesUrl)
            .then(function(response) {
                if (response.status !== 200) {
                    console.log('Looks like there was a problem. Status Code: ' + response.status);
                    return;
                }
                response.json().then(function(data) {
                    holder.siteFavouritesData = data;
                    localStorage.setItem('osbMangaReader.siteFavourites', JSON.stringify(holder.siteFavouritesData));

                    holder.siteFavouritesData.forEach(function(element) {
                        holder.getMangaDetails(element, 'site-favourites', true);
                    });
                });
            })
            .catch(function(err) {
                console.log('Failed');
            });
    };

    setMangaDetails (manga) {
        this.mangaInfo = manga;
        this.section = 'manga-info';
    }

    initSlider() {
        var holder = this;
        setTimeout(function(){
            var viewportSize = window.innerHeight - 90;
            document.querySelector('osb-manga-reader .swiper-container').setAttribute('style','height:' + viewportSize + 'px;');
            var mangaView = new Swiper(document.querySelector('osb-manga-reader .swiper-container'), holder.sliderSettings);
        }, 500);
    }

    getMangaChapter(manga, chapter) {
        this.isLoading = true;
        var holder = this;
        fetch(holder.baseUrl + this.defaultSite  + '/manga/' + manga + '/' + chapter, {
                headers:{'X-Mashape-Authorization': this.apiKey}
            })
            .then(function(response) {
                if (response.status !== 200) {
                    console.log('Looks like there was a problem. Status Code: ' + response.status);
                    return;
                }
                response.json().then(function(data) {
                    holder.mangaChapter = data;
                    holder.section = 'manga-chapter';
                    holder.isLoading = false;
                    holder.initSlider();
                });
            })
            .catch(function(err) {
                console.log('Failed');
            });
    }

    getMangaDetails(manga, section, cache) {
        var holder = this;
        if (holder.mangaDetails.length > 1 && cache) {
            holder.mangaDetails.forEach(function(element) {
                if (manga.title === element.name) {
                    if (section === 'site-favourites' && holder.siteFavouritesDisplay.indexOf(element) == -1) {
                         holder.section = 'site-favourites';
                         holder.siteFavouritesDisplay.push(element);
                         holder.isLoading = false;
                    }
                }
            });
            return false;
        }

        fetch(this.baseUrl + this.defaultSite + '/manga/' + manga.mangaId, {
                headers:{'X-Mashape-Authorization': this.apiKey}
            })
            .then(function(response) {
                if (response.status !== 200) {
                    console.log('Looks like there was a problem. Status Code: ' + response.status);
                    return;
                }
                response.json().then(function(data) {
                    if (cache) {
                        holder.mangaDetails.push(data);
                        localStorage.setItem('osbMangaReader.mangaDetails', JSON.stringify(holder.mangaDetails));
                    }

                    if (section === 'main-view') {
                        holder.section = 'main-view';
                        holder.mainListViewDisplay.push(data);
                        holder.isLoading = false;
                    }

                    if (section === 'site-favourites') {
                        holder.section = 'site-favourites';
                        holder.siteFavouritesDisplay.push(data);
                        holder.isLoading = false;
                    }
                });
            })
            .catch(function(err) {
                console.log('Failed');
            });
    }

    getMainMangaList() {
        var holder = this;
        if (holder.mainListViewData.length > 1) {
            var mainViewData = holder.mainListViewData.slice(0, 20);
            mainViewData.forEach(function(element) {
                holder.getMangaDetails(element, 'main-view', false);
            });
            return false;
        }
        fetch(this.baseUrl + this.defaultSite, {
                headers:{'X-Mashape-Authorization': this.apiKey},
                params: {'cover':'1','info':'1'}
            })
            .then(function(response) {
                if (response.status !== 200) {
                    console.log('Looks like there was a problem. Status Code: ' + response.status);
                    return;
                }
                response.json().then(function(data) {
                    holder.mainListViewData = data;
                    localStorage.setItem('osbMangaReader.mainList', JSON.stringify(holder.mainListViewData));

                    var mainViewData = holder.mainListViewData.slice(0, 20);
                    mainViewData.forEach(function(element) {
                        holder.getMangaDetails(element, 'main-view', false);
                    });
                });
            })
            .catch(function(err) {
                console.log('Failed');
            });
    }
}