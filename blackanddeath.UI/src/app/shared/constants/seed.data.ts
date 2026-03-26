import { Album } from "../models/album";
import { AlbumType } from "../models/enums/album-type.enum";
import { AlbumFormat } from "../models/enums/album-format.enum";
import { Band } from "../models/band";

function toSlug(s: string): string {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function band(id: number, name: string, country: string, genre: string, formedYear: number, logoUrl: string | null): Band {
    return { id: String(id), slug: toSlug(name), name, countries: [{ id: '0', name: country, code: '' }], genres: [{ id: '0', name: genre, parentGenreId: null }], formedYear, logoUrl };
}

function album(id: string, title: string, band: string, type: AlbumType, year: number, country: string, genre: string, coverUrl: string | null): Album {
    return {
        id,
        slug: toSlug(title),
        title,
        releaseDate: year,
        coverUrl,
        type,
        format: AlbumFormat.Digital,
        label: null,
        bands: [{ id: null, name: band, slug: toSlug(band) }],
        countries: [{ id: '0', name: country, code: '' }],
        genres: [{ id: '0', name: genre, parentGenreId: null }],
        streamingLinks: [],
        tracks: [],
    };
}

export class Seed {
    //#region Data
    topRatedThisYear: Album[] = [
        album('1', 'De Mysteriis Dom Sathanas', 'Mayhem', AlbumType.FullLength, 1994, 'Norway', 'Black Metal', 'https://f4.bcbits.com/img/a2368920343_16.jpg'),
        album('2', 'Altars of Madness', 'Morbid Angel', AlbumType.FullLength, 1989, 'USA', 'Death Metal', 'https://f4.bcbits.com/img/a3113054050_10.jpg'),
        album('3', 'Transilvanian Hunger', 'Darkthrone', AlbumType.FullLength, 1994, 'Norway', 'Black Metal', 'https://f4.bcbits.com/img/a1670313978_10.jpg'),
        album('4', 'Tomb of the Mutilated', 'Cannibal Corpse', AlbumType.FullLength, 1992, 'USA', 'Death Metal', 'https://www.metal-archives.com/images/1/3/5/7/1357784.png?3754'),
    ];
    topRatedThisMonth: Album[] = [
        album('5', 'Blessed Are the Sick', 'Morbid Angel', AlbumType.FullLength, 1991, 'USA', 'Death Metal', 'https://picsum.photos/seed/blessed/300/300?grayscale'),
        album('6', 'Covenant', 'Morbid Angel', AlbumType.FullLength, 1993, 'Norway', 'Black Metal', 'https://picsum.photos/seed/covenant/300/300?grayscale'),
        album('7', 'The IVth Crusade', 'Bolt Thrower', AlbumType.FullLength, 1992, 'UK', 'Death Metal', 'https://picsum.photos/seed/crusade/300/300?grayscale'),
        album('8', 'In the Nightside Eclipse', 'Emperor', AlbumType.FullLength, 1994, 'Norway', 'Black Metal', 'https://picsum.photos/seed/emperor/300/300?grayscale'),
    ];
    topRatedAllTime: Album[] = [
        album('9', 'Hvis Lyset Tar Oss', 'Burzum', AlbumType.FullLength, 1994, 'Norway', 'Black Metal', 'https://picsum.photos/seed/hvislyset/300/300?grayscale'),
        album('10', 'Onward to Golgotha', 'Incantation', AlbumType.FullLength, 1992, 'USA', 'Death Metal', 'https://picsum.photos/seed/golgotha/300/300?grayscale'),
        album('11', 'Dawn of Possession', 'Immolation', AlbumType.FullLength, 1991, 'USA', 'Death Metal', 'https://picsum.photos/seed/dawnpossession/300/300?grayscale'),
        album('12', 'Under the Sign of the Black Mark', 'Bathory', AlbumType.FullLength, 1987, 'Sweden', 'Black Metal', 'https://picsum.photos/seed/blackmark/300/300?grayscale'),
    ];

    // Popular Bands
    popularBandsThisYear: Band[] = [
        band(1, 'Mayhem', 'Norway', 'Black Metal', 1984, 'images/bands-logo/photo_1_2026-03-16_00-40-58.jpg'),
        band(2, 'Morbid Angel', 'USA', 'Death Metal', 1983, 'images/bands-logo/photo_2_2026-03-16_00-40-58.jpg'),
        band(3, 'Darkthrone', 'Norway', 'Black Metal', 1986, 'images/bands-logo/photo_3_2026-03-16_00-40-58.jpg'),
    ];
    popularBandsAllTime: Band[] = [
        band(4, 'Bathory', 'Sweden', 'Black Metal', 1983, 'https://picsum.photos/seed/bathory/300/300?grayscale'),
        band(5, 'Deicide', 'USA', 'Death Metal', 1987, 'https://picsum.photos/seed/deicide/300/300?grayscale'),
        band(6, 'Immortal', 'Norway', 'Black Metal', 1990, 'https://picsum.photos/seed/immortal/300/300?grayscale'),
    ];

    // Recently Added
    recentAlbums: Album[] = [
        album('13', 'Progenitors of a New Breed', 'Malicious', AlbumType.FullLength, 2024, 'Finland', 'Black Death Metal', 'https://picsum.photos/seed/progenitors/300/300?grayscale'),
        album('14', 'Ritual of the Abyss', 'Mortifera', AlbumType.EP, 2024, 'Sweden', 'Death Metal', 'https://picsum.photos/seed/ritualabyss/300/300?grayscale'),
        album('15', 'Void Ascendancy', 'Abigor', AlbumType.FullLength, 2024, 'Germany', 'Black Metal', 'https://picsum.photos/seed/voidasc/300/300?grayscale'),
        album('16', 'Necromantic Hymns', 'Nuclearhammer', AlbumType.FullLength, 2023, 'Canada', 'Black Death Metal', 'https://picsum.photos/seed/necrohymns/300/300?grayscale'),
    ];
    recentBands: Band[] = [
        band(7, 'Valdur', 'USA', 'Black Death Metal', 2005, 'https://picsum.photos/seed/valdur/300/300?grayscale'),
        band(8, 'Hetroertzen', 'Chile', 'Black Metal', 2002, 'https://picsum.photos/seed/hetroertzen/300/300?grayscale'),
        band(9, 'Antaeus', 'France', 'Black Metal', 1994, 'https://picsum.photos/seed/antaeus/300/300?grayscale'),
    ];

    // Metal Videos
    videoClips: Band[] = [
        band(10, 'Watain', 'Sweden', 'Black Metal', 1998, 'https://picsum.photos/seed/watain/300/300?grayscale'),
        band(11, 'Behemoth', 'Poland', 'Black Death Metal', 1991, 'https://picsum.photos/seed/behemoth/300/300?grayscale'),
        band(12, 'Mgła', 'Poland', 'Black Metal', 2000, 'https://picsum.photos/seed/mgla/300/300?grayscale'),
    ];
    videoLive: Band[] = [
        band(13, 'Gorgoroth', 'Norway', 'Black Metal', 1992, 'https://picsum.photos/seed/gorgoroth/300/300?grayscale'),
        band(14, 'Cannibal Corpse', 'USA', 'Death Metal', 1988, 'https://picsum.photos/seed/cannibalcorpse/300/300?grayscale'),
        band(15, 'Nile', 'USA', 'Death Metal', 1993, 'https://picsum.photos/seed/nile/300/300?grayscale'),
    ];
    videoPlaythroughs: Band[] = [
        band(16, 'Necrophagist', 'Germany', 'Technical Death Metal', 1992, 'https://picsum.photos/seed/necrophagist/300/300?grayscale'),
        band(17, 'Defeated Sanity', 'Germany', 'Death Metal', 1994, 'https://picsum.photos/seed/defeatedsanity/300/300?grayscale'),
        band(18, 'Hate Eternal', 'USA', 'Death Metal', 1997, 'https://picsum.photos/seed/hateeternal/300/300?grayscale'),
    ];

    // Upcoming Releases
    upcomingFullLength: Album[] = [
        album('17', 'Throne of Chaos', 'Taake', AlbumType.FullLength, 2025, 'Norway', 'Black Metal', 'https://picsum.photos/seed/thronechaos/300/300?grayscale'),
        album('18', 'Rites of Oblivion', 'Funebrarum', AlbumType.FullLength, 2025, 'USA', 'Death Metal', 'https://picsum.photos/seed/ritesoblivion/300/300?grayscale'),
        album('19', 'Abyss Eternal', 'Sargeist', AlbumType.FullLength, 2025, 'Finland', 'Black Death Metal', 'https://picsum.photos/seed/abysseternal/300/300?grayscale'),
        album('20', 'Pestilence Reborn', 'Grave', AlbumType.FullLength, 2025, 'Sweden', 'Death Metal', 'https://picsum.photos/seed/pestilence/300/300?grayscale'),
    ];
    upcomingEP: Album[] = [
        album('21', 'Veil of Darkness', 'Katharsis', AlbumType.EP, 2025, 'Germany', 'Black Metal', 'https://picsum.photos/seed/veildark/300/300?grayscale'),
        album('22', 'Necrotic Hymns', 'Benediction', AlbumType.EP, 2025, 'UK', 'Death Metal', 'https://picsum.photos/seed/necrotichymns/300/300?grayscale'),
        album('23', 'Hellfire Doctrine', 'Teitanblood', AlbumType.EP, 2025, 'USA', 'Black Death Metal', 'https://picsum.photos/seed/hellfire/300/300?grayscale'),
        album('24', 'Serpent Ritual', 'Mgła', AlbumType.EP, 2025, 'Poland', 'Black Metal', 'https://picsum.photos/seed/serpent/300/300?grayscale'),
    ];
    upcomingOther: Album[] = [
        album('25', 'Chaos Invocation', 'Dommedagsnatt', AlbumType.Single, 2025, 'Chile', 'Black Metal', 'https://picsum.photos/seed/chaosinvoc/300/300?grayscale'),
        album('26', 'Demonized', 'Koldbrann', AlbumType.Demo, 2025, 'Norway', 'Death Metal', 'https://picsum.photos/seed/demonized/300/300?grayscale'),
        album('27', 'Wrath Descending', 'Glorior Belli', AlbumType.Split, 2025, 'France', 'Black Metal', 'https://picsum.photos/seed/wrath/300/300?grayscale'),
        album('28', 'Iron Plague', 'Vastum', AlbumType.Compilation, 2025, 'USA', 'Death Metal', 'https://picsum.photos/seed/ironplague/300/300?grayscale'),
    ];

    // Classic Black Death
    classicBlackDeath: Album[] = [
        album('101', 'Onward to Golgotha', 'Incantation', AlbumType.FullLength, 1992, 'USA', 'Classic Black Death', 'https://f4.bcbits.com/img/a3270858501_10.jpg'),
        album('102', 'The Rack', 'Asphyx', AlbumType.FullLength, 1991, 'Netherlands', 'Classic Black Death', 'https://f4.bcbits.com/img/a4039138551_10.jpg'),
        album('103', 'Nespithe', 'Demilich', AlbumType.FullLength, 1993, 'Finland', 'Classic Black Death', 'https://f4.bcbits.com/img/a3758872923_10.jpg'),
        album('104', 'Dawn of Possession', 'Immolation', AlbumType.FullLength, 1991, 'USA', 'Classic Black Death', 'https://f4.bcbits.com/img/a1151529218_10.jpg'),
        album('105', 'The Bleeding', 'Cannibal Corpse', AlbumType.FullLength, 1994, 'USA', 'Classic Black Death', 'https://picsum.photos/seed/bleeding/300/300?grayscale'),
        album('106', 'Altars of Madness', 'Morbid Angel', AlbumType.FullLength, 1989, 'USA', 'Classic Black Death', 'https://f4.bcbits.com/img/a3113054050_10.jpg'),
        album('107', 'Slowly We Rot', 'Obituary', AlbumType.FullLength, 1989, 'USA', 'Classic Black Death', 'https://picsum.photos/seed/slowlywerot/300/300?grayscale'),
        album('108', 'Left Hand Path', 'Entombed', AlbumType.FullLength, 1990, 'Sweden', 'Classic Black Death', 'https://picsum.photos/seed/lefthandpath/300/300?grayscale'),
    ];

    // War Metal
    warMetal: Album[] = [
        album('151', 'Fallen Angel of Doom', 'Proclamation', AlbumType.FullLength, 2000, 'Spain', 'War Metal', 'https://picsum.photos/seed/fallenangel/300/300?grayscale'),
        album('152', 'Goat', 'Revenge', AlbumType.FullLength, 2012, 'Canada', 'War Metal', 'https://picsum.photos/seed/goat/300/300?grayscale'),
        album('153', 'Reaper', 'Conqueror', AlbumType.FullLength, 1999, 'Canada', 'War Metal', 'https://picsum.photos/seed/reaper/300/300?grayscale'),
        album('154', 'Blasphemy', 'Blasphemy', AlbumType.FullLength, 1993, 'Canada', 'War Metal', 'https://picsum.photos/seed/blasphemy/300/300?grayscale'),
        album('155', 'Inri', 'Sarcófago', AlbumType.FullLength, 1987, 'Brazil', 'War Metal', 'https://picsum.photos/seed/inri/300/300?grayscale'),
        album('156', 'Drawing Down the Moon', 'Beherit', AlbumType.FullLength, 1993, 'Finland', 'War Metal', 'https://picsum.photos/seed/drawingdown/300/300?grayscale'),
        album('157', "Forged in Satan's Flames", 'Revenge', AlbumType.FullLength, 2001, 'Canada', 'War Metal', 'https://picsum.photos/seed/forgedsatan/300/300?grayscale'),
        album('158', 'Havohej', 'Havohej', AlbumType.FullLength, 1993, 'USA', 'War Metal', 'https://picsum.photos/seed/havohej/300/300?grayscale'),
    ];

    // Cavernous Black Death
    cavernousBlackDeath: Album[] = [
        album('201', 'Antithesis of Light', 'Abysmal Dawn', AlbumType.FullLength, 2005, 'USA', 'Cavernous Black Death', 'https://f4.bcbits.com/img/a0762853604_10.jpg'),
        album('202', 'Profound Lore', 'Adversarial', AlbumType.FullLength, 2012, 'Canada', 'Cavernous Black Death', 'https://f4.bcbits.com/img/a1669789762_10.jpg'),
        album('203', 'Desolate Endscape', 'Necros Christos', AlbumType.FullLength, 2007, 'Germany', 'Cavernous Black Death', 'https://f4.bcbits.com/img/a0522392822_10.jpg'),
        album('204', 'Ritual of the Abyss', 'Antediluvian', AlbumType.FullLength, 2011, 'Canada', 'Cavernous Black Death', 'https://f4.bcbits.com/img/a3668756138_10.jpg'),
        album('205', 'The Underworld Ascension', 'Portal', AlbumType.FullLength, 2007, 'Australia', 'Cavernous Black Death', 'https://picsum.photos/seed/portal/300/300?grayscale'),
        album('206', 'Vomit Upon the Cross', 'Teitanblood', AlbumType.FullLength, 2009, 'Spain', 'Cavernous Black Death', 'https://picsum.photos/seed/vomitcross/300/300?grayscale'),
        album('207', 'Onward to Golgotha', 'Incantation', AlbumType.FullLength, 1992, 'USA', 'Cavernous Black Death', 'https://f4.bcbits.com/img/a3270858501_10.jpg'),
        album('208', 'Profound Blasphemies', 'Mitochondrion', AlbumType.FullLength, 2011, 'Canada', 'Cavernous Black Death', 'https://picsum.photos/seed/mitochondrion/300/300?grayscale'),
    ];

    // Blackened Death
    blackenedDeath: Album[] = [
        album('301', 'Evangelion', 'Behemoth', AlbumType.FullLength, 2009, 'Poland', 'Blackened Death', 'https://f4.bcbits.com/img/a3979756917_10.jpg'),
        album('302', 'Panopticon', 'Agalloch', AlbumType.FullLength, 2012, 'USA', 'Blackened Death', 'https://f4.bcbits.com/img/a3649907464_10.jpg'),
        album('303', 'Necromancy', 'Grave Miasma', AlbumType.FullLength, 2013, 'UK', 'Blackened Death', 'https://f4.bcbits.com/img/a2734534319_10.jpg'),
        album('304', 'Rites of the Ascension', 'Teitanblood', AlbumType.FullLength, 2014, 'Spain', 'Blackened Death', 'https://f4.bcbits.com/img/a3191197180_10.jpg'),
        album('305', 'The Satanist', 'Behemoth', AlbumType.FullLength, 2014, 'Poland', 'Blackened Death', 'https://picsum.photos/seed/satanist/300/300?grayscale'),
        album('306', 'De Mysteriis Dom Sathanas', 'Mayhem', AlbumType.FullLength, 1994, 'Norway', 'Blackened Death', 'https://f4.bcbits.com/img/a2368920343_16.jpg'),
        album('307', 'A Blaze in the Northern Sky', 'Darkthrone', AlbumType.FullLength, 1992, 'Norway', 'Blackened Death', 'https://picsum.photos/seed/darkthroneb/300/300?grayscale'),
        album('308', 'Anthems to the Welkin at Dusk', 'Emperor', AlbumType.FullLength, 1997, 'Norway', 'Blackened Death', 'https://picsum.photos/seed/emperorwelkin/300/300?grayscale'),
    ];

    // Classic Black Death Bands
    classicBlackDeathBands: Band[] = [
        band(101, 'Incantation', 'USA', 'Classic Black Death', 1989, 'https://picsum.photos/seed/incantation/300/300?grayscale'),
        band(102, 'Asphyx', 'Netherlands', 'Classic Black Death', 1987, 'https://picsum.photos/seed/asphyx/300/300?grayscale'),
        band(103, 'Immolation', 'USA', 'Classic Black Death', 1986, 'https://picsum.photos/seed/immolation/300/300?grayscale'),
    ];

    // War Metal Bands
    warMetalBands: Band[] = [
        band(104, 'Blasphemy', 'Canada', 'War Metal', 1984, 'https://picsum.photos/seed/blasphemyband/300/300?grayscale'),
        band(105, 'Revenge', 'Canada', 'War Metal', 1999, 'https://picsum.photos/seed/revengeband/300/300?grayscale'),
        band(106, 'Conqueror', 'Canada', 'War Metal', 1994, 'https://picsum.photos/seed/conquerorband/300/300?grayscale'),
    ];

    // Cavernous Black Death Bands
    cavernousBlackDeathBands: Band[] = [
        band(107, 'Portal', 'Australia', 'Cavernous Black Death', 1994, 'https://picsum.photos/seed/portalband/300/300?grayscale'),
        band(108, 'Antediluvian', 'Canada', 'Cavernous Black Death', 2008, 'https://picsum.photos/seed/antediluvianband/300/300?grayscale'),
        band(109, 'Mitochondrion', 'Canada', 'Cavernous Black Death', 2003, 'https://picsum.photos/seed/mitochondrionband/300/300?grayscale'),
    ];

    // Blackened Death Bands
    blackenedDeathBands: Band[] = [
        band(110, 'Behemoth', 'Poland', 'Blackened Death', 1991, 'https://picsum.photos/seed/behemothband/300/300?grayscale'),
        band(111, 'Grave Miasma', 'UK', 'Blackened Death', 2002, 'https://picsum.photos/seed/gravemiasma/300/300?grayscale'),
        band(112, 'Teitanblood', 'Spain', 'Blackened Death', 2003, 'https://picsum.photos/seed/teitanbloodband/300/300?grayscale'),
    ];

    //#endregion
}
