import Attributes, { Attribute } from "./attributes";
import Model from "./model";


export enum EventReminderMethod {
    Email = 'email',
    Popup = 'popup',
    Display = 'display',
    Sound = 'sound'
}

export type EventReminderProperties = {
    reminderMinutes?: string;
    reminderMethod?: EventReminderMethod

}

export class EventReminder extends Model
    implements EventReminderProperties {
    reminderMinutes?: string;
    reminderMethod?: EventReminderMethod
    static attributes: Record<string, Attribute> = {
        meetingCode: Attributes.String({
            modelKey: 'reminderMinutes',
            jsonKey: 'reminder_minutes',
        }),
        reminderMethod: Attributes.String({
            modelKey: 'reminderMethod',
            jsonKey:'reminder_method'
        }),
    };

    constructor(props?: EventReminderProperties) {
        super();
        this.initAttributes(props);
    }
}

