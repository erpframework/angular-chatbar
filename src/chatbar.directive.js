import ngModule from './_module';
import {initResizer} from './utils';

ngModule.directive('jloChatbar', function () {
	return {
		restrict: 'AE',
		transclude: true,
		scope: true,
		controller: function ($scope, $element, $attrs, $transclude, jloChatbar) {
			$element.addClass('jlo-chatbar');

			this.$transclude = $transclude;

			this.$scope = $scope;

			this.chatList = jloChatbar.list;

			this.chatVarName = $attrs.chat;
			this.ctrlVarName = $attrs.ctrl;

			this.open = (chat, focus) => (chat.opened = true, focus && jloChatbar.focusChat(chat.data));
			this.minimize = (chat) => chat.opened = false;
			this.remove = (chat) => jloChatbar.removeChat(chat.data);
			this.focus = (chat) => jloChatbar.focusChat(chat.data);
		},
		controllerAs: 'chatBarCtrl',
		template: [
			'<jlo-chatbar-chat-internal ng-repeat="chat in chatBarCtrl.chatList track by chat.id" tabindex="-1">', //tabindex is for mouse wheel scrolling
			'</jlo-chatbar-chat-internal>'
		].join('')
	};
});

ngModule.directive('jloChatbarResizer', function () {
	return {
		require: '^^jloChatbarChatInternal',
		restrict: 'AE',
		transclude: 'element',
		link: function ($scope, $element, $attrs, ctrl) {
			var resizerElt;

			resizerElt = angular.element('<div class="jlo-chatbar__resizer"></div>');

			$element.after(resizerElt);
			$element.remove();

			initResizer(resizerElt, ctrl.element);
		}
	};
});

ngModule.directive('jloChatbarFocus', function ($q, $window) {
	return {
		require: '^^jloChatbarChatInternal',
		restrict: 'AE',
		link: function ($scope, $element, $attrs, ctrl) {
			$scope.$on('jlo.chatbar.focus', function (event, chat) {
				if (chat === ctrl.chat.data) {
					setTimeout(function () {
						$element[0].focus();
						$window.scrollTo(0, 0); //because focus moves out of viewport
					}, $attrs.jloChatbarFocus && parseInt($attrs.jloChatbarFocus, 10) || 1);
				}
			});
		}
	};
});

ngModule.directive('jloChatbarScroll', function ($window) {
	return {
		require: '^^?jloChatbarChatInternal',
		restrict: 'AE',
		link: function ($scope, $element, $attrs, ctrl) {
			var isBottom,
				expr = $attrs.jloChatbarScroll || '',
				matches,
				watchExpr,
				resizeTimeout
			;

			matches = expr.match(/^\s*(?:autoscroll\s+on\s+(.+))?\s*$/);

			watchExpr = matches[1];

			function updateScroll() {
				isBottom && ($element[0].scrollTop = $element[0].scrollHeight);
			}

			//update isBottom state when scrolled
			$element.on('scroll', function () {
				isBottom = this.scrollTop + this.offsetHeight >= this.scrollHeight;
			});

			//update scroll when chat is resized
			if (ctrl) {
				ctrl.element.on('jlo-chat-resize', updateScroll);
				$scope.$on('$destroy', () => ctrl.element.off('jlo-chat-resize', updateScroll));
			}

			//update scroll when window is resized
			function onResize() {
				resizeTimeout && clearTimeout(resizeTimeout);
				resizeTimeout = setTimeout(function () {
					updateScroll();
					resizeTimeout = undefined;
				}, 100);
			}
			angular.element($window).on('resize', onResize);
			$scope.$on('$destroy', () => angular.element($window).off('resize', onResize));

			//initial update scroll
			isBottom = true;
			if (watchExpr) {
				$scope.$watchCollection(() => [].concat($scope.$eval(watchExpr)), updateScroll);
			} else {
				setTimeout(updateScroll, 1);
			}
		}
	};
});
