import { Album } from "../models/album";
import { Band } from "../models/band";

export class Seed {
    //#region Data
    topRatedThisYear: Album[] = [
        { id: 1, title: 'De Mysteriis Dom Sathanas', band: 'Mayhem', type: 'Full-Length', year: 1994, country: 'Norway', genre: 'Black Metal', coverImage: 'https://f4.bcbits.com/img/a2368920343_16.jpg' },
        { id: 2, title: 'Altars of Madness', band: 'Morbid Angel', type: 'Full-Length', year: 1989, country: 'USA', genre: 'Death Metal', coverImage: 'https://f4.bcbits.com/img/a3113054050_10.jpg' },
        { id: 3, title: 'Transilvanian Hunger', band: 'Darkthrone', type: 'Full-Length', year: 1994, country: 'Norway', genre: 'Black Metal', coverImage: 'https://f4.bcbits.com/img/a1670313978_10.jpg' },
        { id: 4, title: 'Tomb of the Mutilated', band: 'Cannibal Corpse', type: 'Full-Length', year: 1992, country: 'USA', genre: 'Death Metal', coverImage: 'https://www.metal-archives.com/images/1/3/5/7/1357784.png?3754' },
    ];
    topRatedThisMonth: Album[] = [
        { id: 5, title: 'Blessed Are the Sick', band: 'Morbid Angel', type: 'Full-Length', year: 1991, country: 'USA', genre: 'Death Metal', coverImage: 'https://picsum.photos/seed/blessed/300/300?grayscale' },
        { id: 6, title: 'Covenant', band: 'Morbid Angel', type: 'Full-Length', year: 1993, country: 'Norway', genre: 'Black Metal', coverImage: 'https://picsum.photos/seed/covenant/300/300?grayscale' },
        { id: 7, title: 'The IVth Crusade', band: 'Bolt Thrower', type: 'Full-Length', year: 1992, country: 'UK', genre: 'Death Metal', coverImage: 'https://picsum.photos/seed/crusade/300/300?grayscale' },
        { id: 8, title: 'In the Nightside Eclipse', band: 'Emperor', type: 'Full-Length', year: 1994, country: 'Norway', genre: 'Black Metal', coverImage: 'https://picsum.photos/seed/emperor/300/300?grayscale' },
    ];
    topRatedAllTime: Album[] = [
        { id: 9, title: 'Hvis Lyset Tar Oss', band: 'Burzum', type: 'Full-Length', year: 1994, country: 'Norway', genre: 'Black Metal', coverImage: 'https://picsum.photos/seed/hvislyset/300/300?grayscale' },
        { id: 10, title: 'Onward to Golgotha', band: 'Incantation', type: 'Full-Length', year: 1992, country: 'USA', genre: 'Death Metal', coverImage: 'https://picsum.photos/seed/golgotha/300/300?grayscale' },
        { id: 11, title: 'Dawn of Possession', band: 'Immolation', type: 'Full-Length', year: 1991, country: 'USA', genre: 'Death Metal', coverImage: 'https://picsum.photos/seed/dawnpossession/300/300?grayscale' },
        { id: 12, title: 'Under the Sign of the Black Mark', band: 'Bathory', type: 'Full-Length', year: 1987, country: 'Sweden', genre: 'Black Metal', coverImage: 'https://picsum.photos/seed/blackmark/300/300?grayscale' },
    ];

    // Popular Bands
    popularBandsThisYear: Band[] = [
        { id: 1, name: 'Mayhem', country: 'Norway', genre: 'Black Metal', formedYear: 1984, coverImage: 'https://picsum.photos/seed/mayhem/300/300?grayscale' },
        { id: 2, name: 'Morbid Angel', country: 'USA', genre: 'Death Metal', formedYear: 1983, coverImage: 'https://picsum.photos/seed/morbidangel/300/300?grayscale' },
        { id: 3, name: 'Darkthrone', country: 'Norway', genre: 'Black Metal', formedYear: 1986, coverImage: 'https://picsum.photos/seed/darkthrone/300/300?grayscale' },
    ];
    popularBandsAllTime: Band[] = [
        { id: 4, name: 'Bathory', country: 'Sweden', genre: 'Black Metal', formedYear: 1983, coverImage: 'https://picsum.photos/seed/bathory/300/300?grayscale' },
        { id: 5, name: 'Deicide', country: 'USA', genre: 'Death Metal', formedYear: 1987, coverImage: 'https://picsum.photos/seed/deicide/300/300?grayscale' },
        { id: 6, name: 'Immortal', country: 'Norway', genre: 'Black Metal', formedYear: 1990, coverImage: 'https://picsum.photos/seed/immortal/300/300?grayscale' },
    ];

    // Recently Added
    recentAlbums: Album[] = [
        { id: 13, title: 'Progenitors of a New Breed', band: 'Malicious', type: 'Full-Length', year: 2024, country: 'Finland', genre: 'Black Death Metal', coverImage: 'https://picsum.photos/seed/progenitors/300/300?grayscale' },
        { id: 14, title: 'Ritual of the Abyss', band: 'Mortifera', type: 'EP', year: 2024, country: 'Sweden', genre: 'Death Metal', coverImage: 'https://picsum.photos/seed/ritualabyss/300/300?grayscale' },
        { id: 15, title: 'Void Ascendancy', band: 'Abigor', type: 'Full-Length', year: 2024, country: 'Germany', genre: 'Black Metal', coverImage: 'https://picsum.photos/seed/voidasc/300/300?grayscale' },
        { id: 16, title: 'Necromantic Hymns', band: 'Nuclearhammer', type: 'Full-Length', year: 2023, country: 'Canada', genre: 'Black Death Metal', coverImage: 'https://picsum.photos/seed/necrohymns/300/300?grayscale' },
    ];
    recentBands: Band[] = [
        { id: 7, name: 'Valdur', country: 'USA', genre: 'Black Death Metal', formedYear: 2005, coverImage: 'https://picsum.photos/seed/valdur/300/300?grayscale' },
        { id: 8, name: 'Hetroertzen', country: 'Chile', genre: 'Black Metal', formedYear: 2002, coverImage: 'https://picsum.photos/seed/hetroertzen/300/300?grayscale' },
        { id: 9, name: 'Antaeus', country: 'France', genre: 'Black Metal', formedYear: 1994, coverImage: 'https://picsum.photos/seed/antaeus/300/300?grayscale' },
    ];

    // Metal Videos
    videoClips: Band[] = [
        { id: 10, name: 'Watain', country: 'Sweden', genre: 'Black Metal', formedYear: 1998, coverImage: 'https://picsum.photos/seed/watain/300/300?grayscale' },
        { id: 11, name: 'Behemoth', country: 'Poland', genre: 'Black Death Metal', formedYear: 1991, coverImage: 'https://picsum.photos/seed/behemoth/300/300?grayscale' },
        { id: 12, name: 'Mgła', country: 'Poland', genre: 'Black Metal', formedYear: 2000, coverImage: 'https://picsum.photos/seed/mgla/300/300?grayscale' },
    ];
    videoLive: Band[] = [
        { id: 13, name: 'Gorgoroth', country: 'Norway', genre: 'Black Metal', formedYear: 1992, coverImage: 'https://picsum.photos/seed/gorgoroth/300/300?grayscale' },
        { id: 14, name: 'Cannibal Corpse', country: 'USA', genre: 'Death Metal', formedYear: 1988, coverImage: 'https://picsum.photos/seed/cannibalcorpse/300/300?grayscale' },
        { id: 15, name: 'Nile', country: 'USA', genre: 'Death Metal', formedYear: 1993, coverImage: 'https://picsum.photos/seed/nile/300/300?grayscale' },
    ];
    videoPlaythroughs: Band[] = [
        { id: 16, name: 'Necrophagist', country: 'Germany', genre: 'Technical Death Metal', formedYear: 1992, coverImage: 'https://picsum.photos/seed/necrophagist/300/300?grayscale' },
        { id: 17, name: 'Defeated Sanity', country: 'Germany', genre: 'Death Metal', formedYear: 1994, coverImage: 'https://picsum.photos/seed/defeatedsanity/300/300?grayscale' },
        { id: 18, name: 'Hate Eternal', country: 'USA', genre: 'Death Metal', formedYear: 1997, coverImage: 'https://picsum.photos/seed/hateeternal/300/300?grayscale' },
    ];

    // Upcoming Releases
    upcomingFullLength: Album[] = [
        { id: 17, title: 'Throne of Chaos', band: 'Taake', type: 'Full-Length', year: 2025, country: 'Norway', genre: 'Black Metal', coverImage: 'https://picsum.photos/seed/thronechaos/300/300?grayscale' },
        { id: 18, title: 'Rites of Oblivion', band: 'Funebrarum', type: 'Full-Length', year: 2025, country: 'USA', genre: 'Death Metal', coverImage: 'https://picsum.photos/seed/ritesoblivion/300/300?grayscale' },
        { id: 19, title: 'Abyss Eternal', band: 'Sargeist', type: 'Full-Length', year: 2025, country: 'Finland', genre: 'Black Death Metal', coverImage: 'https://picsum.photos/seed/abysseternal/300/300?grayscale' },
        { id: 20, title: 'Pestilence Reborn', band: 'Grave', type: 'Full-Length', year: 2025, country: 'Sweden', genre: 'Death Metal', coverImage: 'https://picsum.photos/seed/pestilence/300/300?grayscale' },
    ];
    upcomingEP: Album[] = [
        { id: 21, title: 'Veil of Darkness', band: 'Katharsis', type: 'EP', year: 2025, country: 'Germany', genre: 'Black Metal', coverImage: 'https://picsum.photos/seed/veildark/300/300?grayscale' },
        { id: 22, title: 'Necrotic Hymns', band: 'Benediction', type: 'EP', year: 2025, country: 'UK', genre: 'Death Metal', coverImage: 'https://picsum.photos/seed/necrotichymns/300/300?grayscale' },
        { id: 23, title: 'Hellfire Doctrine', band: 'Teitanblood', type: 'EP', year: 2025, country: 'USA', genre: 'Black Death Metal', coverImage: 'https://picsum.photos/seed/hellfire/300/300?grayscale' },
        { id: 24, title: 'Serpent Ritual', band: 'Mgła', type: 'EP', year: 2025, country: 'Poland', genre: 'Black Metal', coverImage: 'https://picsum.photos/seed/serpent/300/300?grayscale' },
    ];
    upcomingOther: Album[] = [
        { id: 25, title: 'Chaos Invocation', band: 'Dommedagsnatt', type: 'Single', year: 2025, country: 'Chile', genre: 'Black Metal', coverImage: 'https://picsum.photos/seed/chaosinvoc/300/300?grayscale' },
        { id: 26, title: 'Demonized', band: 'Koldbrann', type: 'Demo', year: 2025, country: 'Norway', genre: 'Death Metal', coverImage: 'https://picsum.photos/seed/demonized/300/300?grayscale' },
        { id: 27, title: 'Wrath Descending', band: 'Glorior Belli', type: 'Split', year: 2025, country: 'France', genre: 'Black Metal', coverImage: 'https://picsum.photos/seed/wrath/300/300?grayscale' },
        { id: 28, title: 'Iron Plague', band: 'Vastum', type: 'Compilation', year: 2025, country: 'USA', genre: 'Death Metal', coverImage: 'https://picsum.photos/seed/ironplague/300/300?grayscale' },
    ];

    // Classic Black Death
    classicBlackDeath: Album[] = [
        { id: 101, title: 'Onward to Golgotha', band: 'Incantation', type: 'Full-Length', year: 1992, country: 'USA', genre: 'Classic Black Death', coverImage: 'https://f4.bcbits.com/img/a3270858501_10.jpg' },
        { id: 102, title: 'The Rack', band: 'Asphyx', type: 'Full-Length', year: 1991, country: 'Netherlands', genre: 'Classic Black Death', coverImage: 'https://f4.bcbits.com/img/a4039138551_10.jpg' },
        { id: 103, title: 'Nespithe', band: 'Demilich', type: 'Full-Length', year: 1993, country: 'Finland', genre: 'Classic Black Death', coverImage: 'https://f4.bcbits.com/img/a3758872923_10.jpg' },
        { id: 104, title: 'Dawn of Possession', band: 'Immolation', type: 'Full-Length', year: 1991, country: 'USA', genre: 'Classic Black Death', coverImage: 'https://f4.bcbits.com/img/a1151529218_10.jpg' },
    ];

    // Cavernous Black Death
    cavernousBlackDeath: Album[] = [
        { id: 201, title: 'Antithesis of Light', band: 'Abysmal Dawn', type: 'Full-Length', year: 2005, country: 'USA', genre: 'Cavernous Black Death', coverImage: 'https://f4.bcbits.com/img/a0762853604_10.jpg' },
        { id: 202, title: 'Profound Lore', band: 'Adversarial', type: 'Full-Length', year: 2012, country: 'Canada', genre: 'Cavernous Black Death', coverImage: 'https://f4.bcbits.com/img/a1669789762_10.jpg' },
        { id: 203, title: 'Desolate Endscape', band: 'Necros Christos', type: 'Full-Length', year: 2007, country: 'Germany', genre: 'Cavernous Black Death', coverImage: 'https://f4.bcbits.com/img/a0522392822_10.jpg' },
        { id: 204, title: 'Ritual of the Abyss', band: 'Antediluvian', type: 'Full-Length', year: 2011, country: 'Canada', genre: 'Cavernous Black Death', coverImage: 'https://f4.bcbits.com/img/a3668756138_10.jpg' },
    ];

    // Blackened Death
    blackenedDeath: Album[] = [
        { id: 301, title: 'Evangelion', band: 'Behemoth', type: 'Full-Length', year: 2009, country: 'Poland', genre: 'Blackened Death', coverImage: 'https://f4.bcbits.com/img/a3979756917_10.jpg' },
        { id: 302, title: 'Panopticon', band: 'Agalloch', type: 'Full-Length', year: 2012, country: 'USA', genre: 'Blackened Death', coverImage: 'https://f4.bcbits.com/img/a3649907464_10.jpg' },
        { id: 303, title: 'Necromancy', band: 'Grave Miasma', type: 'Full-Length', year: 2013, country: 'UK', genre: 'Blackened Death', coverImage: 'https://f4.bcbits.com/img/a2734534319_10.jpg' },
        { id: 304, title: 'Rites of the Ascension', band: 'Teitanblood', type: 'Full-Length', year: 2014, country: 'Spain', genre: 'Blackened Death', coverImage: 'https://f4.bcbits.com/img/a3191197180_10.jpg' },
    ];

    //#endregion

}