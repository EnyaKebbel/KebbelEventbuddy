import Event from './event.js';
import Participant from './participant.js';
import Tag from './tag.js';
import FilterCriteria from './filter-criteria.js';

//View States als Konstanten definieren
export const VIEWS = Object.freeze({
    LIST: "list",
    DETAIL: "detail",
    FORM: "form",
    TAGS: "tags",
    PARTICIPANTS: "participants",
});

class EventBuddyModel extends EventTarget {
    #events;
    #currentEvent;
    #participants;
    #tags;
    #filterCriteria;
    #currentView;

    constructor() {
        super();
        this.#events = new Map();
        this.#currentEvent = undefined;
        this.#participants = new Map();
        this.#tags = new Map();
        this.#filterCriteria = new FilterCriteria({status:"alle", tagId:"alle", participantId:"alle"});
        this.#currentView = "list";
        this.#loadFromJSON();
    }

    //Getters
    get events(){
        return this.#events;
    }
    get tags(){
        return this.#tags;
    }
    get participants(){
        return this.#participants;
    }
    get currentEvent(){
        return this.#currentEvent;
    }
    get filterCriteria(){
        return this.#filterCriteria;
    }
    get currentView(){
        return this.#currentView;
    }

    //Business Regeln (Methoden)
    //Events
    getEventById(eventId){
        return this.#events.get(String(eventId));
    }

    setSelectedEvent(eventId){
        this.#currentEvent = String(eventId);
        this.dispatchEvent(new CustomEvent("selectionChanged", { detail: this.#currentEvent }));
    }

    //löscht aktuelle Auswahl und informiert views
    clearSelection() {
        this.#currentEvent = undefined;
        this.dispatchEvent(new CustomEvent("selectionChanged", { detail: undefined }));
    }

    createEvent(event) {
        this.#events.set(String(event.id), event);
        // 2) optional: "eventCreated" / "addEvent" falls du das irgendwo nutzt
        this.dispatchEvent(new CustomEvent("addEvent", { detail: event }));
        this.dispatchEvent(new CustomEvent("eventsChanged"));
    }

    updateEvent(event) {
        const id = String(event.id);
        if (!this.#events.has(id)) return;
        this.#events.set(id, event);
        //Detail neu rendern wenn ausgewählt
        if (this.#currentEvent === id) {
            this.dispatchEvent(new CustomEvent("selectionChanged", { detail: id }));
        }
        this.dispatchEvent(new CustomEvent("eventsChanged"));
    }

    deleteEvent(eventId){
        this.#events.delete(String(eventId));
        // Falls das gelöschte Event aktuell ausgewählt war
        if(this.#currentEvent === eventId){
            this.#currentEvent = undefined;
            this.dispatchEvent(new CustomEvent("selectionChanged", { detail: undefined }));
        }
        // Liste hat sich geändert → EventList neu rendern
        this.dispatchEvent(new CustomEvent("eventsChanged"));
    }

    //Tags
    getTagById(tagId){
        return this.#tags.get(String(tagId));
    }

    // Helper: Prüfen ob Tag in irgendeinem Event verwendet wird
    isTagUsed(tagId) {
        const id = String(tagId);
        return [...this.#events.values()].some(ev => (ev.tagIds ?? []).includes(id));
    }

    createTag(name) {
        const id = (crypto?.randomUUID ? crypto.randomUUID() : `t${Date.now()}`);

        const tag = new Tag({ id, name: String(name ?? "") });

        this.addTag(tag);
        return tag;
    }

    addTag(tag) {
        this.#tags.set(String(tag.id), tag);
        this.dispatchEvent(new CustomEvent("addTag", { detail: tag }));
        this.dispatchEvent(new CustomEvent("tagsChanged"));
    }

    updateTag(tagId, newName) {
        const id = String(tagId);
        const currentTag = this.#tags.get(id);
        if (!currentTag) return false;

        const updatedTag = new Tag({
            id,
            name: String(newName ?? "").trim(),
        });

        this.#tags.set(id, updatedTag);
        this.dispatchEvent(new CustomEvent("tagsChanged"));
        return true;
    }

    deleteTag(tagId) {
        const id = String(tagId);

        // Nicht löschen, wenn noch verwendet
        if (this.isTagUsed(id)) {
            this.dispatchEvent(new CustomEvent("tagDeleteBlocked", { detail: id }));
            return false;
        }
        this.#tags.delete(id);
        this.dispatchEvent(new CustomEvent("tagsChanged", { detail: id }));
        return true;
    }

    //Teilnehmer
    getParticipantById(participantId){
        return this.#participants.get(participantId);
    }

    //Filter
    setFilters(criteria){
        this.#filterCriteria = new FilterCriteria(criteria);
        this.dispatchEvent(new CustomEvent("filtersChanged", { detail: this.#filterCriteria }));
    }

    //Die Syntax dieser Methode wurde von KI generiert (Filtersystem)
    getEventsFiltered(){
        const {status, tagId, participantId} = this.#filterCriteria;
        return [...this.#events.values()].filter(ev => {
            const statusOk = status === "alle" || ev.status === status;
            const tagOk = tagId === "alle" || (ev.tagIds ?? []).includes(tagId);
            const participantOk = participantId === "alle" || (ev.participantIds ?? []).includes(participantId);
            return statusOk && tagOk && participantOk;
        });
    }

    //View-Panels setzen
    setView(view){
        // wenn gleich, nichts tun
        if (this.#currentView === view) return;

        this.#currentView = view;
        this.dispatchEvent(new CustomEvent("viewChanged", { detail: view }));
    }

    //json laden
    #loadFromJSON(){
        //Events
        fetch("./json/events.json")
            .then(r => r.json())
            .then(data => {
                for(const e of data) {
                    const ev = new Event(e);
                    this.#events.set(ev.id, ev);
                }
                this.dispatchEvent(new CustomEvent("eventsChanged"));
            });

        //Tags
        fetch("./json/tags.json")
            .then(r => r.json())
            .then(data => {
                for (const t of data) {
                    const tag = new Tag(t);
                    this.#tags.set(tag.id, tag);
                }
                this.dispatchEvent(new CustomEvent("tagsChanged"));
            });

        //Teilnehmer
        fetch("./json/participants.json")
            .then(r => r.json())
            .then(data => {
                for (const p of data) {
                    const part = new Participant(p);
                    this.#participants.set(part.id, part);
                }
                this.dispatchEvent(new CustomEvent("participantsChanged"));
            });
    }

}
export const model = new EventBuddyModel();