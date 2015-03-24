(function (factory) {
  if (typeof define === "function" && define.amd) {
    define("angular-chatbar/_module", ["exports"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  }
})(function (exports) {
  "use strict";

  exports["default"] = angular.module("jlo-chatbar", []);
});
(function (factory) {
  if (typeof define === "function" && define.amd) {
    define("angular-chatbar", ["exports", "angular-chatbar/chatbar"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("angular-chatbar/chatbar"));
  }
})(function (exports, _angularChatbarChatbar) {
  "use strict";
});
(function (factory) {
	if (typeof define === "function" && define.amd) {
		define("angular-chatbar/chatbar.directive", ["exports", "./_module", "./utils"], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require("./_module"), require("./utils"));
	}
})(function (exports, _module2, _utils) {
	"use strict";

	var ngModule = _module2["default"];
	var initResizer = _utils.initResizer;

	ngModule.directive("jloChatbar", function () {
		return {
			restrict: "AE",
			transclude: true,
			scope: true,
			controller: function controller($scope, $element, $attrs, $window, jloChatbar) {
				var _this = this;
				$element.addClass("jlo-chatbar");

				this.$scope = $scope;

				this.chatList = jloChatbar.list;

				this.chatVarName = $attrs.chat;
				this.ctrlVarName = $attrs.ctrl;

				this.open = function (chat, focus) {
					chat.opened = true;
					focus && jloChatbar.focusChat(chat.data);
				};

				this.minimize = function (chat) {
					chat.opened = false;
				};

				this.remove = function (chat) {
					jloChatbar.removeChat(chat.data);
				};
			},
			controllerAs: "chatBarCtrl",
			template: ["<div style=\"display:none;\" ng-transclude></div>", "<jlo-chatbar-chat-internal ng-repeat=\"chat in chatBarCtrl.chatList track by chat.id\">", "</jlo-chatbar-chat-internal>"].join("")
		};
	});

	ngModule.directive("jloChatbarMinimized", function () {
		return {
			require: "^^jloChatbar",
			restrict: "E",
			priority: 700,
			terminal: true,
			transclude: "element",
			link: function link($scope, $element, $attrs, ctrl, $transclude) {
				ctrl.minimizedTransclude = $transclude;
			}
		};
	});

	ngModule.directive("jloChatbarOpen", function () {
		return {
			require: "^^jloChatbar",
			restrict: "E",
			priority: 700,
			terminal: true,
			transclude: "element",
			link: function link($scope, $element, $attrs, ctrl, $transclude) {
				ctrl.openTransclude = $transclude;
			}
		};
	});

	ngModule.directive("jloChatbarResizer", function () {
		return {
			require: "^^jloChatbarChatInternal",
			restrict: "AE",
			transclude: "element",
			link: function link($scope, $element) {
				var chatElt, chatOpenElt, resizerElt;

				chatElt = $element;
				do {
					chatElt = chatElt.parent();
				} while (chatElt.length && chatElt[0] !== document && chatElt[0].tagName.toLowerCase() !== "jlo-chatbar-open");

				if (!chatElt.length || chatElt[0] === document) {
					throw new Error("jlo-chatbar-resizer must be inside jlo-chatbar-open");
				}

				resizerElt = angular.element("<div class=\"jlo-chatbar__resizer\"></div>");

				$element.after(resizerElt);
				$element.remove();

				initResizer(resizerElt, chatElt);
			}
		};
	});

	ngModule.directive("jloChatbarFocus", function ($q, $window) {
		return {
			require: "^^jloChatbarChatInternal",
			restrict: "AE",
			link: function link($scope, $element, $attrs, ctrl) {
				$scope.$on("jlo.chatbar.focus", function (event, chat) {
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
});
(function (factory) {
	if (typeof define === "function" && define.amd) {
		define("angular-chatbar/chatbar.internal.directive", ["exports", "./_module"], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require("./_module"));
	}
})(function (exports, _module2) {
	"use strict";

	var ngModule = _module2["default"];

	ngModule.directive("jloChatbarChatInternal", function ($animate) {
		return {
			require: ["jloChatbarChatInternal", "^^jloChatbar"],
			restrict: "AE",
			controller: function controller() {},
			link: function internalDirective($scope, $element, $attrs, ctrls) {
				var ctrl = ctrls[0],
				    jloChatbarCtrl = ctrls[1];

				if (!jloChatbarCtrl.minimizedTransclude && !jloChatbarCtrl.openTransclude) {
					return;
				}

				var scope = $scope.$new(),
				    elts = {},
				    facade = {
					remove: function remove() {
						jloChatbarCtrl.remove(ctrl.chat);
					},
					minimize: function minimize() {
						jloChatbarCtrl.minimize(ctrl.chat);
					},
					open: function open(focus) {
						jloChatbarCtrl.open(ctrl.chat, focus);
					}
				};

				ctrl.chat = $scope.chat;
				jloChatbarCtrl.chatVarName && (scope[jloChatbarCtrl.chatVarName] = ctrl.chat.data);
				jloChatbarCtrl.ctrlVarName && (scope[jloChatbarCtrl.ctrlVarName] = facade);

				$element.empty().addClass("jlo-chatbar__chat").toggleClass("jlo-chatbar__chat--open", $scope.chat.opened);

				$scope.$watch("chat", function (value) {
					ctrl.chat = value;
					scope[jloChatbarCtrl.chatVarName] = ctrl.chat.data;
				});

				$scope.$watch("chat.opened", function (value) {
					setTimeout(function () {
						elts.open && elts.open.toggleClass("jlo-chatbar__open--visible", value);
					}, 1);

					$animate[value ? "addClass" : "removeClass"]($element, "jlo-chatbar__chat--open");
				});

				if (jloChatbarCtrl.openTransclude) {
					jloChatbarCtrl.openTransclude(scope, function (clone, scope) {
						elts.open = clone;
						clone.addClass("jlo-chatbar__open");
						$animate.enter(clone, $element);
					});
				}

				if (jloChatbarCtrl.minimizedTransclude) {
					jloChatbarCtrl.minimizedTransclude(scope, function (clone, scope) {
						elts.minimized = clone;
						clone.addClass("jlo-chatbar__minimized");
						$animate.enter(clone, $element);
					});
				}
			}
		};
	});
});
(function (factory) {
  if (typeof define === "function" && define.amd) {
    define("angular-chatbar/chatbar", ["exports", "./chatbar.internal.directive", "./chatbar.directive", "./chatbar.service"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("./chatbar.internal.directive"), require("./chatbar.directive"), require("./chatbar.service"));
  }
})(function (exports, _chatbarInternalDirective, _chatbarDirective, _chatbarService) {
  "use strict";
});
(function (factory) {
	if (typeof define === "function" && define.amd) {
		define("angular-chatbar/chatbar.service", ["exports", "./_module"], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require("./_module"));
	}
})(function (exports, _module2) {
	"use strict";

	var ngModule = _module2["default"];

	ngModule.provider("jloChatbar", function () {
		var _chatId;

		this.chatId = function (val) {
			if (!angular.isFunction(val)) {
				_chatId = function (chat) {
					return chat[val];
				};
				return;
			}

			_chatId = val;
		};

		this.chatId("id");

		this.$get = function ($rootScope, $timeout) {
			var service = {
				list: []
			};

			function indexOfChat(chat) {
				return service.list.reduce(function (res, c, index) {
					if (res >= 0) {
						return res;
					}
					if (c.data === chat) {
						return index;
					}
					return res;
				}, -1);
			}

			service.addChat = function (chat, opened, focus) {
				var idx = indexOfChat(chat),
				    current;

				if (idx !== -1) {
					current = service.list.splice(idx, 1)[0];
				}

				opened = current && current.opened || !!opened;

				service.list.unshift(Object.defineProperties({
					data: chat,
					opened: opened
				}, {
					id: {
						get: function () {
							return _chatId(this.data);
						},
						configurable: true,
						enumerable: true
					}
				}));

				if (opened && focus) {
					$timeout(function () {
						return $rootScope.$broadcast("jlo.chatbar.focus", chat);
					});
				}
			};

			service.focusChat = function (chat) {
				var idx = indexOfChat(chat),
				    current;

				if (idx !== -1) {
					$timeout(function () {
						return $rootScope.$broadcast("jlo.chatbar.focus", service.list[idx].data);
					});
				}
			};

			service.removeChat = function (chat) {
				var idx = indexOfChat(chat);
				if (idx !== -1) {
					service.list.splice(idx, 1);
				}
			};

			return service;
		};
	});
});
(function (factory) {
	if (typeof define === "function" && define.amd) {
		define("angular-chatbar/utils", ["exports"], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports);
	}
})(function (exports) {
	"use strict";

	function initResizer(resizerElt, chatElt) {
		var startX, startY, startWidth, startHeight;

		resizerElt.on("mousedown", initDrag);

		function doDrag(e) {
			chatElt.css("height", startHeight + startY - e.clientY + "px");
		}

		function stopDrag(e) {
			angular.element(document.body).removeClass("jlo-chatbar-noselect");
			angular.element(document).off("mousemove", doDrag).off("mouseup", stopDrag);
		}

		function initDrag(e) {
			chatElt.data("jlo-chatbar-chat-resized", true);

			startY = e.clientY;
			startHeight = parseInt(document.defaultView.getComputedStyle(chatElt[0]).height, 10);

			angular.element(document.body).addClass("jlo-chatbar-noselect");
			angular.element(document).on("mousemove", doDrag).on("mouseup", stopDrag);
		}
	}

	exports.initResizer = initResizer;
});