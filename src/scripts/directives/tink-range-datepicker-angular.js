'use strict';
(function(module) {
  try {
    module = angular.module('tink.rangedatepicker');
  } catch (e) {
    module = angular.module('tink.rangedatepicker', ['tink.datehelper','tink.safeApply','tink.formathelper']);
  }
  module.directive('tinkDatepickerRange',['$q', '$templateCache', '$http', 'calView', '$sce','$compile','dateCalculator','$window','safeApply', function ($q, $templateCache, $http, calView, $sce,$compile,dateCalculator,$window,safeApply) {
      return {
        restrict: 'E',
        replace: false,
        priority:0,
        require:['?^form'],
        templateUrl: 'templates/tinkDatePickerRangeInputs.html',
        controller:function($scope,$attrs){
          $scope.dynamicName = $attrs.name;
          if(angular.isDefined($attrs.required)){
            $scope.requiredVal = true;
          }else{
            $scope.requiredVal = false;
          }
        },
        scope: {
          firstDate: '=?',
          lastDate: '=?',
          minDate:'=?',
          maxDate:'=?',
          isDisabled:'=?'
        },
        compile: function(template,$attr){
          if($attr.required === '' || $attr.required === 'required'){
            template.find('input:first').attr('data-require',true);
            template.find('input:last').attr('data-require',true);
          }
          if($attr.name){
            template.find('input:first').attr('name',$attr.name);
            template.find('input:last').attr('name',$attr.name);
          }
          return{
            pre:function(){},
            post:function postLink(scope, element,attrs,form) {
          var $directive = {
            open: false,
            focused: {firstDateElem: element.find('div[tink-format-input] div:first'), lastDateElem: element.find('div[tink-format-input] div:last')},
            elem:{},
            calendar: {first:element.find('span.datepicker-icon:first'),last:element.find('span.datepicker-icon:last')},
            tbody:{firstDateElem:null,lastDateElem:null},
            focusedModel: null,
            selectedDates: {first: scope.firstDate, last: scope.lastDate},
            valid:{firstDateElem:false,lastDateElem:false},
            mouse: 0,
            viewDate:new Date(),
            hardCodeFocus: false,
            values:{fist:null,last:null}
          };
          if(attrs.name && form[0]){
            scope.ctrlconst = form[0][attrs.name];
          }

          $directive.focused.firstDateElem

          $directive.calendar.first.on('click',function(){
            if(!isDisabled()){
              if(isTouch){
                element.find('input[type=date]:first').click();
              }else{
                if($directive.open){
                  if($directive.focusedModel ==='firstDateElem'){
                    hide();
                  }else{
                    $directive.focused.firstDateElem.focus();
                  }
                }else{
                  $directive.focused.firstDateElem.focus();
                }
              }
            }
          });
          $directive.calendar.last.on('click',function(){
            if(!isDisabled()){
              if(isTouch){
                element.find('input[type=date]:last').click();
              }else{
                if($directive.open){
                   if($directive.focusedModel ==='lastDateElem'){
                    hide();
                  }else{
                    $directive.focused.lastDateElem.focus();
                  }
                }else{
                  $directive.focused.lastDateElem.focus();
                }
              }
            }
          });

            // -- check if we are using a touch device  --/
             var isDateSupported = function() {
                var i = document.createElement('input');
                i.setAttribute('type', 'date');
                return i.type !== 'text';
              };

             var isNative = /(ip(a|o)d|iphone|android)/ig.test($window.navigator.userAgent);
             var isTouch = ('createTouch' in $window.document) && isNative && isDateSupported();

            // labels for the days you can make this variable //
            var dayLabels = ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'];
             // -- create the labels  --/
             scope.dayLabels = $sce.trustAsHtml('<th>' + dayLabels.join('</th><th>') + '</th>');
            // Add a watch to know when input changes from the outside //

            scope.$watch('firstDate', function () {
              if(scope.firstDate !== null){
                $directive.focusedModel = 'firstDateElem';
               scope.$select(scope.firstDate,null,true);
               buildView();
             }else{
                checkValidity();
             }


            });
            // Add a watch to know when input changes from the outside //
            scope.$watch('lastDate', function () {
            if(scope.lastDate !== null){
              $directive.focusedModel = 'lastDateElem';
              scope.$select(scope.lastDate,null,true);
              buildView();
            }else{
              checkValidity();
            }
          });

              // -- the config is for the devolopers to change ! for in the future  --/
              // -- the $directive is four the directive hehehe ;) to keep track of stuff --/
    var
    config = {
      dateFormat: 'dd/mm/yyyy'
    },
    fetchPromises = {};
      scope.pane={prev:0,next:0};

            // -- This builds the view --/
            function buildView() {

              if(checkBefore($directive.viewDate,scope.minDate)){
                scope.pane.prev = 1;
                $directive.viewDate = new Date(scope.minDate);
              }else{
                scope.pane.prev = 0;
              }
              if(checkAfter($directive.viewDate,scope.maxDate)){
                scope.pane.next = 1;
                $directive.viewDate = new Date(scope.maxDate);
              }else{
                scope.pane.next = 0;
              }

               // -- Retrieve the elements we want to change ! we have to do this because we replace the tbodys !  --/
               $directive.tbody.firstDateElem = element.find('tbody')[0];
               $directive.tbody.lastDateElem = element.find('tbody')[1];

              // -- Create the first calendar --/
              var htmlFirst = calView.createMonthDays($directive.viewDate, $directive.selectedDates.first, $directive.selectedDates.last,'prevMonth',scope.minDate,scope.maxDate);
               // -- Replace and COMPILE the nieuw calendar view  --/
               angular.element($directive.tbody.firstDateElem).replaceWith($compile( htmlFirst)( scope ));

               // -- Copy the viewDate ! COPY otherwhise you got problems, because of refenties and stuff ;-)  --/
                var copyViewDate = new Date($directive.viewDate);

               // -- add a month  --/
               copyViewDate.setDate(5);
               copyViewDate.setMonth(copyViewDate.getMonth() + 1);

               // -- place the right titles in the scope  --/
               scope.firstTitle = dateCalculator.format($directive.viewDate, 'mmmm yyyy');
               scope.lastTitle = dateCalculator.format(copyViewDate, 'mmmm yyyy');


              // -- create the second view   --/
              var htmlLast = calView.createMonthDays(copyViewDate, $directive.selectedDates.first, $directive.selectedDates.last,'nextMonth',scope.minDate,scope.maxDate);
               // -- compile and replace the second view   --/
               angular.element($directive.tbody.lastDateElem).replaceWith($compile( htmlLast)( scope ));

             }
            
           

            function checkBefore(date,before){
              if(!angular.isDate(date)){
                return false;
              }
              if(!angular.isDate(before)){
                return false;
              }
              var copyDate = new Date(date.getFullYear(),date.getMonth(),1);
              var copyBefore = new Date(before.getFullYear(),before.getMonth(),1);

              if(dateCalculator.dateBeforeOther(copyBefore,copyDate)){
                return true;
              }
              return false;

            }
            function checkAfter(date,after){
              if(!angular.isDate(date)){
                return false;
              }
              if(!angular.isDate(after)){
                return false;
              }
              var copyDate = new Date(date.getFullYear(),date.getMonth(),1);
              var copyafter = new Date(after.getFullYear(),after.getMonth(),1);

              if(dateCalculator.dateBeforeOther(copyDate,copyafter)){
                return true;
              }
              return false;
            }
              var first =  element.find('#input:first').controller('ngModel');
              var last = element.find('#input:last').controller('ngModel');
            // -- to change the month of the calender --/
            function nextMonth() {
              // -- add one month to the viewDate --/
              $directive.viewDate.setDate(1);
              $directive.viewDate.setMonth($directive.viewDate.getMonth() + 1);
              // -- reload the viewdate :P  --/
              setViewDate($directive.viewDate);
            }
            // -- to change the month of the calender --/
            function prevMonth() {
              // -- remove one month from the viewDate --/
              $directive.viewDate.setDate(1);
              $directive.viewDate.setMonth($directive.viewDate.getMonth() - 1);
               // -- reload the viewdate woopwoop  --/
               setViewDate($directive.viewDate);
             }

             // -- function to build the view again  --/
             function setViewDate(viewDate) {
             // try {
               // -- check if there is a date given  --/
               if (angular.isDate(viewDate) && viewDate !== null) {
                if (angular.isDate(viewDate)) {

                  var hulpDate = new Date(viewDate.getTime());
                  hulpDate.setDate(1);
                  hulpDate.setMonth(hulpDate.getMonth()-1);
                  if(!dateCalculator.isSameMonth(viewDate,$directive.viewDate) && !dateCalculator.isSameMonth(hulpDate,$directive.viewDate)){
                        // -- change the global variable  --/
                        $directive.viewDate = new Date(viewDate);
                      }
                       // -- build the entire view  --/
                       buildView();

                     } else {
                      console.logerror('Wrong date');
                    }
                  }else {

                  }
            //  } catch (e) {
             //   console.log(e);
             // }
           }

            // -- To load the template for the popup but we can change this ! no html file is better
            // if it is finished we can but it in the javascript file with $cacheTemplate --/
            function haalTemplateOp(template) {
              // --- if the template already is in our app cache return it. //
              if (fetchPromises[template]){
                return fetchPromises[template];
              }
              // --- If not get the template from templatecache or http. //
              return (fetchPromises[template] = $q.when($templateCache.get(template) || $http.get(template))
                .then(function (res) {
                  // --- When the template is retrieved return it. //
                  if (angular.isObject(res)) {
                    $templateCache.put(template, res.data);
                    return res.data;
                  }
                  return res;
                }));
            }
            var templateElem;
            var promise = haalTemplateOp('templates/tinkDatePickerRange.html');
            // --- when the data is loaded //
            promise.then(function (template) {
              if (angular.isObject(template)){
                template = template.data;
              }
              // --- store the html we retrieved //
              templateElem = $compile(template);
              templateElem = templateElem(scope, function () {});
              templateElem.css({position: 'absolute', display: 'none'});
              element.append(templateElem);
              init();
            });

            function init() {
              if (isTouch) {
                config.dateFormat = 'yyyy-mm-dd';
                angular.element($directive.focused.firstDateElem).prop('type','date');
                angular.element($directive.focused.lastDateElem).prop('type','date');
              }
              scope.dateFormat = config.dateFormat;
              bindEvents();
            }

            scope.$select = function (el,format,hardcoded) {
              if(!angular.isDefined(format)){
                  format = 'yyyy/mm/dd';
              }
              var date;
              if(angular.isDate(el)){
                date = el;
              }else{
                date = dateCalculator.getDate(el,format);
              }

              if ($directive.focusedModel !== null) {
                if ($directive.focusedModel === 'firstDateElem') {
                  scope.firstDate = date;
                  //first.$setViewValue(new Date())
                  if(!angular.isDate(scope.lastDate)){
                    if(!hardcoded){
                      setTimeout(function(){ $directive.focused.lastDateElem.focus(); }, 1);
                    }
                  }else{
                    if(dateCalculator.dateBeforeOther(scope.firstDate,scope.lastDate)){
                      scope.lastDate = null;
                      if(!hardcoded){
                        setTimeout(function(){ $directive.focused.lastDateElem.focus(); }, 1);
                      }
                    }
                  }

                } else if ($directive.focusedModel === 'lastDateElem') {
                  scope.lastDate = date;
                  if(!angular.isDate(scope.firstDate)){
                    if(!hardcoded){
                      setTimeout(function(){ $directive.focused.firstDateElem.focus(); }, 1);
                    }
                  }else{
                    if(!dateCalculator.dateBeforeOther(scope.lastDate,scope.firstDate)){
                     scope.firstDate = null;
                      if(!hardcoded){
                        setTimeout(function(){ $directive.focused.firstDateElem.focus(); }, 1);
                      }
                    }
                  }

                }

              }
              checkValidity();
            };

            function validFormat(date, format) {
                var dateObject;
                //Check if the date is not null and defined
                if (angular.isDefined(date) && date !== null) {
                  //check if de date is in a string form;
                  if (typeof date === 'string') {
                    //check if the length of the string has de proper length.
                    if (date.length !== 10) { return false; }
                    //if we are on touch we do not have to check
                    if (!isTouch && !/^(?:(?:31(\/)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/.test(date)) { return false; }
                    //get a date object
                    dateObject = dateCalculator.getDate(date, format);
                  } else if (angular.isDate(date)) {
                    //if we already got a date object use that one
                    dateObject = date;
                  } else if (typeof date === 'function') {
                    //if it is a function call the function and recheck the data;
                    return validFormat(date(), format);
                  } else {
                    //in all other cases false !
                    return false;
                  }
                  //check if we got a valid date.
                  return dateObject.toString() !== 'Invalid Date';
                }
              }

            var noErrorClass = 'hide-error';
            var firstEl = $(element.find('.faux-input')[0]);
            var lastEl = $(element.find('.faux-input')[1]);

            var prevFirst;
            $directive.focused.firstDateElem.bind('valueChanged', function (e, val) {
              //We put this in a safeaply because we are out of the angular scope !
              safeApply(scope, function () {

                if (validFormat(val, 'dd/mm/yyyy')) {
                  //Convert the String Date to a Date object and put it as the selected date.
                  $directive.selectedDates.first = dateCalculator.getDate(val, 'dd/mm/yyyy');
                  //ctrl[0].$setViewValue($directive.selectedDate);
                  //addTime($directive.selectedDate,scope.ngModel);
                  //change the view date to the date we have selected.
                  setViewDate($directive.selectedDates.first);
                  //Build the datepicker again because we have changed the variables.
                  buildView();

                }

                //Check if the date we received is a valid date.
                if(firstEl && prevFirst !== val){
                  firstEl.controller('ngModel').$setDirty();
                }
                $directive.values.first = val;
                prevFirst = val;
              });
            });

            var prevLast;
            $directive.focused.lastDateElem.bind('valueChanged', function (e, val) {
              //We put this in a safeaply because we are out of the angular scope !
              safeApply(scope, function () {

                if (validFormat(val, 'dd/mm/yyyy')) {
                  //Convert the String Date to a Date object and put it as the selected date.
                  $directive.selectedDates.last = dateCalculator.getDate(val, 'dd/mm/yyyy');
                  //ctrl[0].$setViewValue($directive.selectedDate);
                  //addTime($directive.selectedDate,scope.ngModel);
                  //change the view date to the date we have selected.
                  setViewDate($directive.selectedDates.last);
                  //Build the datepicker again because we have changed the variables.
                  buildView();

                }
                //Check if the date we received is a valid date.
                if(lastEl && prevLast !== val){
                  lastEl.controller('ngModel').$setDirty();
                }
                $directive.values.last = val;
                prevLast = val;
              });
            });

            function checkValidity(){
                //scope.ctrlconst.$setValidity('required',true);
                if(scope.firstDate === null && scope.lastDate !== null){
                  first.$setValidity('date-required',false);
                  firstEl.removeClass(noErrorClass);
                }else if(scope.firstDate !== null && scope.lastDate === null){
                  last.$setValidity('date-required',false);
                  lastEl.removeClass(noErrorClass);
                }else if(scope.firstDate === null && scope.lastDate === null){
                  if(angular.isDefined(attrs.required)){
                    first.$setValidity('date-required',false);
                    last.$setValidity('date-required',false);
                    firstEl.removeClass(noErrorClass);
                    lastEl.removeClass(noErrorClass);
                  }else{
                    first.$setValidity('date-required',true);
                    last.$setValidity('date-required',true);
                    firstEl.addClass(noErrorClass);
                    lastEl.addClass(noErrorClass);
                  }
                }else if(scope.firstDate !== null && scope.lastDate !== null){
                  first.$setValidity('date-required',true);
                  last.$setValidity('date-required',true);
                  firstEl.addClass(noErrorClass);
                    lastEl.addClass(noErrorClass);
                }

                if(first.$error.date){
                  first.$setValidity('date-required',true);
                  firstEl.addClass(noErrorClass);
                }
                if(last.$error.date){
                  last.$setValidity('date-required',true);
                  lastEl.addClass(noErrorClass);
                }
            }

            function isDisabled(){
              return scope.isDisabled;
            }

            function $onMouseDown (evt) {
              if(!isDisabled()){
                if (evt.target.isContentEditable) {
                  evt.target.focus();
                  if(isTouch){
                    evt.preventDefault();
                    evt.stopPropagation();
                  }
                }else{
                  evt.preventDefault();
                  evt.stopPropagation();
                }

                if(isTouch){
                  var targetEl = angular.element(evt.target);

                  if (targetEl[0].nodeName.toLowerCase() !== 'button') {
                    targetEl = targetEl.parent();
                  }
                  targetEl.triggerHandler('click');
                }
              }
            }

            scope.$selectPane = function (value) {

              if (value) {
                nextMonth();
              } else {
                prevMonth();
              }
            };

            function hide() { // TH comment out to inspect element
              //if(!(evt.relatedTarget && evt.relatedTarget.nodeName === 'INPUT')){
                templateElem.css({display: 'none'});
                $directive.open = false;
                $directive.focusedModel = null;
                safeApply(scope,function(){
                 // checkValidity();
                 var firstDate = $directive.values.first;
                 if(firstDate !== null && firstDate !== undefined){
                  scope.firstDate = dateCalculator.getDate($directive.values.first, 'dd/mm/yyyy');
                 }

                 var lastDate = $directive.values.last;
                 if(lastDate !== null && lastDate !== undefined){
                  scope.lastDate = dateCalculator.getDate($directive.values.last, 'dd/mm/yyyy');
                 }
                 
                });

              //}
            }

            // -- event liseners to know if you are hitting the right elements --/
            element.on('mouseleave', function () {
              $directive.mouse = 0;
            });
            element.on('mouseenter', function () {
              $directive.mouse = 1;
            });

            function bindEvents() {
              if(!isTouch){
                element.bind('touchstart mousedown',$onMouseDown);
              }

              element.bind('focus',function(){
                setTimeout(function(){
                  $($directive.focused.firstDateElem).focus();
                },5);
              })

              angular.element($directive.focused.firstDateElem).bind('blur', hide);
              angular.element($directive.focused.lastDateElem).bind('blur', hide);

              angular.element($directive.focused.firstDateElem).bind('focus', function () {
                safeApply(scope,function(){
                  if(!isDisabled()){
                    $directive.focusedModel = 'firstDateElem';
                    show();
                  };
                });
              });

              angular.element($directive.focused.lastDateElem).bind('focus', function () {
                safeApply(scope,function(){
                  if(!isDisabled()){
                    $directive.focusedModel = 'lastDateElem';
                    show();
                  };
                });
              });
            }


            function show() {
              if (!$directive.open) {
              // -- check if there is an input field focused --/
              if ($directive.focusedModel !== null) {

                // -- if firstelement is focused and we have an corret date show that date --/
                if ($directive.focusedModel === 'firstDateElem' && angular.isDate(scope.firstDate)) {
                 setViewDate(scope.firstDate);
               }else if($directive.focusedModel === 'firstDateElem' && angular.isDate(scope.lastDate)){
                 setViewDate(scope.lastDate);
               } else if($directive.focusedModel === 'lastDateElem' && angular.isDate(scope.lastDate)){
                 setViewDate(scope.lastDate);
               } else if($directive.focusedModel === 'lastDateElem' && angular.isDate(scope.firstDate)){
                 setViewDate(scope.firstDate);
               }else{
                setViewDate(new Date());
              }

            }else{
                // -- no inputfield focused ! so take the date of today --/
                setViewDate(new Date());
              }
              $directive.open = true;
              templateElem.css({display: 'block'});
            }

          }

        }

          };

        }
      };
    }])
})();
