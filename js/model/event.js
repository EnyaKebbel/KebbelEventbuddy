export default class Event{
    #id;
    #title;
    #img;
    #dateTime;
    #location;
    #description;
    #status;
    #tagIds;
    #participantIds;

    constructor({id, title, img, dateTime, location, description, status, tagIds=[], participantIds=[]}) {
        this.#id = id;
        this.#title = title;
        this.#img = img;
        this.#dateTime = dateTime;
        this.#location = location;
        this.#description = description;
        this.#status = status;
        this.#tagIds = tagIds;
        this.#participantIds = participantIds;
    }

    get id() {
        return this.#id;
    }

    get title() {
        return this.#title;
    }

    get img() {
        return this.#img;
    }

    get dateTime() {
        return this.#dateTime;
    }

    get location() {
        return this.#location;
    }

    get description() {
        return this.#description;
    }

    get status() {
        return this.#status;
    }

    get tagIds() {
        return this.#tagIds;
    }

    get participantIds() {
        return this.#participantIds;
    }
}