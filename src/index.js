/**
 * @author 白开水
 * @since 2020-08-15
 * 消息队列
 * 
 */

 function snakemq() {
  this.listeners = {};
  this.inited = false;
  state: 0;
}

snakemq.prototype.init = function () {
  if (!this.inited) {
    window.addEventListener("storage", (event) => {
      let storageArea = event.storageArea;
      if (storageArea && storageArea[event.key]) {
        let key = event.key;
        let value = event.newValue;
        let listeners = this.listeners[key];
        if (listeners) {
          //消费消息
          try{
            let msg = JSON.parse(value);
            if (msg['_snake_mark_'] == 'snakemq') {
              listeners.forEach(f => f(msg.content, key));
            }
          } catch(e) {
            console.error(e);
          }
          //删除消息
          // localStorage && localStorage.removeItem(event.key);
        }
      }

    });
    this.inited = true;
  }
}

/**
 * 添加消息监听器
 */
snakemq.prototype.addListener = function (name, callback) {
  this.init();
  let listeners = this.listeners[name] || [];
  let isAdd = true;
  for (let i = 0; i < listeners.length; i++) {
    let listenerCallback = listeners[i];
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
  let listeners = this.listeners[name] || [];
  if (callback) {
    let index = null;
    for (let i = 0; i < listeners.length; i++) {
      let listenerCallback = listeners[i];
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
  let msg = {
    content: value,
    timestamp: Date.now(),
    _snake_mark_: 'snakemq'
  }
  msg = JSON.stringify(msg);
  let setItemEvent = new Event("storage");
  setItemEvent.key = name;
  setItemEvent.newValue = msg;
  setItemEvent.storageArea = {};
  setItemEvent.storageArea[name] = msg;
  window.dispatchEvent(setItemEvent);
  localStorage && localStorage.setItem(name, msg);
};

export default new snakemq();