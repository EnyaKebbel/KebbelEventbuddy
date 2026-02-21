export default class filterCriteria {
    #status;
    #tagId;
    #participantId;

    constructor({ status = "alle", tagId = "alle", participantId = "alle" } = {}) {
        this.#status = status;
        this.#tagId = tagId;
        this.#participantId = participantId;
    }

    get status() {
        return this.#status;
    }

    get tagId() {
        return this.#tagId;
    }

    get participantId() {
        return this.#participantId;
    }
}