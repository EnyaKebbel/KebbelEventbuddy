import {model} from "./model/model.js";

class Controller {
    init() {
        const eventList = document.querySelector("event-list");
        const eventDetail = document.querySelector("event-detail");

        //Klick auf "Details" in einem Item
        eventList.addEventListener("select-event", (e) => {
            //Model: ruft von view - welches event?
            model.setSelectedEvent(e.detail);
            model.setView("detail");
        });

        //EVENT: löschen in Detailansicht
        eventDetail.addEventListener("delete-event", (e) => {
            if (confirm("Event wird endgültig gelöscht?")) {
                model.deleteEvent(e.detail);
                model.clearSelection();
                model.setView("list");
            }
        });

        // EVENT: bearbeiten in Detailansicht
        eventDetail.addEventListener("edit-event", (e) => {
            console.log("Controller received edit-event", e.detail);
            model.setSelectedEvent(e.detail);
            model.setView("form");
        });

        // "Neues Event" Button -> Form öffnen
        const newEventBtn = document.querySelector("#btn-new-event")
        newEventBtn.addEventListener("click", () => {
            model.clearSelection();
            model.setView("form");
        });

        const eventForm = document.querySelector("event-form");
        // FORM: create-event aus event-form.js abfangen
        eventForm.addEventListener("create-event", (e) => {
            console.log("Controller received create-event", e.detail);
            model.createEvent(e.detail);
            model.clearSelection();
            model.setView("list");
        });

        // FORM: update-event aus event-form.js abfangen
        eventForm.addEventListener("update-event", (e) => {
            console.log("Controller received update-event", e.detail);
            model.updateEvent(e.detail);
            model.setView("list");
        });

        // FORM: abbrechen
        eventForm.addEventListener("cancel-form", () => {
            model.clearSelection();
            model.setView("list");
        });

        // TAGS
        const btnTags = document.querySelector("#btn-tags");
        btnTags.addEventListener("click", (e) => {
            model.clearSelection();
            model.setView("tags");
        });

        const tagManager = document.querySelector("tag-manager");
        // TAG: Tag anlegen
        tagManager.addEventListener("create-tag", (e) => {
            model.createTag(e.detail.name);
        });

        // TAG: Tag löschen
        tagManager.addEventListener("delete-tag", (e) => {
        model.deleteTag(e.detail);
        });

        //Wenn Tag verwendet -> alert
        model.addEventListener("tagDeleteBlocked", (e) => {
            alert("Tag kann nicht gelöscht werden, weil er noch verwendet wird.");
        });

        // FILTER
        // 3) Optional: Filter Änderungen (wenn du Filter als Web Component machst)
        // filterView.addEventListener("filters-changed", (e)=> model.setFilters(e.detail))
    }
}
export const controller = new Controller();