# DomusPicturae

A public website template for a contemporary art gallery: a multilingual catalogue of artists and artworks, plus the exhibitions, workshops and news the gallery publishes.

## Language

### Catalogue

**Artist**:
A person whose artworks the gallery represents. An artist may be an Estate.
_Avoid_: Creator, author, maker

**Estate**:
An Artist who is deceased and represented through their estate. Listed separately from living artists.
_Avoid_: Legacy artist, deceased artist

**Artwork**:
A single physical piece by one Artist, with a title, year, medium and dimensions.
_Avoid_: Piece, work, item, product

**Availability**:
The commercial state of an Artwork: _available_, _sold_, or _not for sale_. Exactly one applies at a time.
_Avoid_: Status, isSold, isPrivateCollection

**Catalogue**:
The Artworks the gallery offers or has sold: every Artwork whose Availability is _available_ or _sold_.
_Avoid_: Collection (ambiguous with Private Collection), inventory, all artworks

**Private Collection**:
The public-facing name for the Artworks whose Availability is _not for sale_. The complement of the Catalogue: together they are every Artwork the gallery holds, and an Artist's page lists both.
_Avoid_: Gallery collection, NFS works

**Viewing Room**:
An immersive scroll presentation of the whole Catalogue. A way of showing the Catalogue, not a subset of it.
_Avoid_: Showroom, gallery view

### Programme

**Exhibition**:
A dated show of Artworks at the gallery, with a start date, end date, opening hours and admission.
_Avoid_: Show, event (as a synonym)

**Workshop**:
A class or course the gallery runs that people register for.
_Avoid_: Masterclass, course, class

**Event**:
The umbrella term for Exhibitions and Workshops together, used only where both are listed side by side.
_Avoid_: Happening, programme item

**News**:
A dated editorial post published by the gallery, optionally with a slideshow.
_Avoid_: Article, blog post, press

### Localisation

**Locale**:
One of the languages the site is published in. The site has one default Locale, served without a URL prefix; every other Locale is served under its prefix.
_Avoid_: Language, lang, translation

**Localisable field**:
A content field that has one value per Locale (titles, descriptions, biographies). The default Locale's value is the reference: a missing translation falls back to it, and never to a third Locale. Fields that are the same in every Locale (images, dates, dimensions) are not localisable.
_Avoid_: Translated field, i18n field
