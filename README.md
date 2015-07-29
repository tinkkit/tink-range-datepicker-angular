# Tink range datepicker Angular directive

v1.0.4

## What is this repository for?

The Tink Angular range-datepicker gives you the ability to select a series of dates.

Tink is an in-house developed easy-to-use front-end framework for quick prototyping and simple deployment of all kinds of websites and apps, keeping a uniform and consistent look and feel.

## Setup

### Prerequisites

* nodeJS [http://nodejs.org/download/](http://nodejs.org/download/)
* bower: `npm install -g bower`

### Install

1. Go to the root of your project and type the following command in your terminal:

   `bower install tink-range-datepicker-angular --save`

2. Add the following files to your project:

   `<link rel="stylesheet" href="bower_components/tink-core/dist/tink.css" />` (or one of the Tink themes)

   `<script src="bower_components/tink-range-datepicker-angular/dist/tink-range-datepicker-angular.js"></script>`

   `<script src="bower_components/tink-helper-date-angular/dist/tink-helper-date-angular.js"></script>`

   `<script src="bower_components/tink-helper-format-angular/dist/tink-helper-format-angular.js"></script>`

   `<script src="bower_components/tink-helper-safe-apply-angular/dist/tink-helper-safe-apply-angular.js"></script>`

3. Add `tink.rangedatepicker` to your app module's dependency.

   `angular.module('myApp', ['tink.rangedatepicker']);`



----------



## How to use

### tink-datepicker-range

To use this directive you have to add the element `<tink-datepicker-range></tink-datepicker-range>` to your html page.
Do not forget to add the attributes `first-date` and `last-date` otherwise it wil not work !

To retrieve the first selected date, attach a scope variable, for example `firstSelectedDate`, from your controller to the attribute `first-date. This is the same for the second date.

```html
<tink-datepicker-range data-first-date="firstSelectedDate" data-last-date="lastSelectedDate"></tink-datepicker-range>
```

### Options

Attr | Type | Default | Details
--- | --- | --- | ---
data-first-date (required) | `[object]` | `[]` | This variable holds a date object with the first selected date.
data-last-date (required) | `[object]` | `[]` | This variable holds a date object with the second selected date.
data-max-date | `date` | `null` | When a date cannot be larger then the given max date.
data-min-date | `date` | `null` | When a date cannot be minor then the given min date.
data-ng-model | `date` | `null` | The date value.

### Example

A working example can be found in [the Tink documentation](http://tink.digipolis.be/#/docs/directives/range-datepicker#example).

## Contribution guidelines

* If you're not sure, drop us a note
* Fork this repo
* Do your thing
* Create a pull request

## Who do I talk to?

* Jasper Van Proeyen - jasper.vanproeyen@digipolis.be - Lead front-end
* Tom Wuyts - tom.wuyts@digipolis.be - Lead UX
* [The hand](https://www.youtube.com/watch?v=_O-QqC9yM28)
