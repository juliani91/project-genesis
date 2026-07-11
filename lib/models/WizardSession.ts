import { Wizard } from "./Wizard";
import { WizardAnswer } from "./WizardAnswer";

export interface WizardSession {
    /**
     * Wizard definition used for this session.
     */
    wizard: Wizard;

    /**
     * Answers collected during the session.
     */
    answers: readonly WizardAnswer[];

    /**
     * Time the session began.
     */
    startedAt: Date;

    /**
     * Time the session completed.
     *
     * Undefined means the session is still in progress.
     */
    completedAt?: Date;
}