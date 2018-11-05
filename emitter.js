'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы several и through
 */
const isStar = true;

function getAllEventsInChain(event) {
    const events = event.split('.');
    const resultEventList = [];
    let string = '';
    events.forEach(e => {
        string += e;
        resultEventList.unshift(string);
        string += '.';
    });

    return resultEventList;
}

function safeGet(event, eventList) {
    if (typeof eventList[event] === 'undefined') {
        eventList[event] = [];
    }

    return eventList[event];
}

function getObjectWithAllProperties(context, handler,
    times = Number.MAX_SAFE_INTEGER, frequency = 1) {
    return {
        context: context,
        handler: handler,
        times: times,
        frequency: frequency,
        callsCount: 0
    };
}

function realEmit(event, eventList) {
    Object.keys(eventList)
        .filter(e => e === event)
        .forEach(e => {
            eventList[e].forEach(student => {
                if ((student.times - student.callsCount > 0) &&
                    (student.callsCount % student.frequency === 0)) {
                    student.handler.call(student.context);
                }
                student.callsCount += 1;
            });
        });
}

/**
 * Возвращает новый emitter
 * @returns {Object}
 */
function getEmitter() {
    const eventsList = {};

    return {

        /**
         * Подписаться на событие
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @returns {Object} this
         */
        on: function (event, context, handler) {
            safeGet(event, eventsList).push(
                getObjectWithAllProperties(context, handler)
            );

            return this;
        },

        /**
         * Отписаться от события
         * @param {String} event
         * @param {Object} context
         * @returns {Object} this
         */
        off: function (event, context) {
            Object.keys(eventsList)
                .filter(key => key.startsWith(event))
                .forEach(key => {
                    for (let i = 0; i < eventsList[key].length; i++) {
                        if (eventsList[key][i].context === context) {
                            eventsList[key].splice(i, 1);
                        }
                    }
                });

            return this;
        },

        /**
         * Уведомить о событии
         * @param {String} event
         * @returns {Object} this
         */
        emit: function (event) {
            const events = getAllEventsInChain(event);
            events.forEach(e => {
                realEmit(e, eventsList);
            });

            return this;
        },

        /**
         * Подписаться на событие с ограничением по количеству полученных уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} times – сколько раз получить уведомление
         * @returns {Object} this
         */
        several: function (event, context, handler, times) {
            if (typeof times !== 'number' || times < 1) {
                this.on(event, context, handler);
            }
            safeGet(event, eventsList).push(getObjectWithAllProperties(context, handler, times));

            return this;
        },

        /**
         * Подписаться на событие с ограничением по частоте получения уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} frequency – как часто уведомлять
         * @returns {Object} this
         */
        through: function (event, context, handler, frequency) {
            if (typeof frequency !== 'number' || frequency < 1) {
                this.on(event, context, handler);
            }
            safeGet(event, eventsList).push(
                getObjectWithAllProperties(context, handler, undefined, frequency)
            );

            return this;
        }
    };
}

module.exports = {
    getEmitter,

    isStar
};
