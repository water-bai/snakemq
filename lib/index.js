'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * @author 白开水
 * @since 2020-08-15
 * 消息队列
 * 
 */

function snakemq() {
  this.listeners = {};
  this.inited = false;
}

snakemq.prototype.init = function () {
  var _this = this;

  if (!this.inited) {
    window.addEventListener("storage", function (event) {
      var storageArea = event.storageArea;
      if (storageArea && storageArea[event.key]) {
        var key = event.key;
        var value = event.newValue;
        var listeners = _this.listeners[key];
        if (listeners) {
          //消费消息
          try {
            var msg = JSON.parse(value);
            if (msg['_snake_mark_'] == 'snakemq') {
              listeners.forEach(function (f) {
                return f(msg.content, key);
              });
            }
          } catch (e) {
            console.error(e);
          }
          //删除消息
          // localStorage && localStorage.removeItem(event.key);
        }
      }
    });
    this.inited = true;
  }
};

/**
 * 添加消息监听器
 */
snakemq.prototype.addListener = function (name, callback) {
  this.init();
  var listeners = this.listeners[name] || [];
  var isAdd = true;
  for (var i = 0; i < listeners.length; i++) {
    var listenerCallback = listeners[i];
    if (listenerCallback == callback) {
      isAdd = false;
      break;
    }
  }
  if (isAdd && typeof callback == 'function') {
    listeners.push(callback);
  }
  this.listeners[name] = listeners;
};

/**
 * 移除消息监听器
 */
snakemq.prototype.removeListener = function (name, callback) {
  var listeners = this.listeners[name] || [];
  if (callback) {
    var index = null;
    for (var i = 0; i < listeners.length; i++) {
      var listenerCallback = listeners[i];
      if (listenerCallback == callback) {
        index = i;
        break;
      }
    }
    if (index) {
      listeners.splice(index, 1);
    }
  } else {
    listeners = [];
  }
  this.listeners[name] = listeners;
};

/**
 * 发送消息，注意消息要求可序列化
 */
snakemq.prototype.sendMessage = function (name, value) {
  var msg = {
    content: value,
    timestamp: Date.now(),
    _snake_mark_: 'snakemq'
  };
  msg = JSON.stringify(msg);
  var setItemEvent = new Event("storage");
  setItemEvent.key = name;
  setItemEvent.newValue = msg;
  setItemEvent.storageArea = {};
  setItemEvent.storageArea[name] = msg;
  window.dispatchEvent(setItemEvent);
  localStorage && localStorage.setItem(name, msg);
};

exports.default = new snakemq();