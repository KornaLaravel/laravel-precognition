import { Poll, PollTimeout } from './types'

const createPoll = (callback: () => Promise<unknown>): Poll => {
    let polling = false
    let timeoutID: NodeJS.Timeout|null = null
    let timeout = 60000 // default: one minute

    const schedule = () => {
        timeoutID = polling
            ? setTimeout(() => callback().finally(schedule), timeout)
            : null
    }

    return {
        every(t) {
            const prepared: Required<PollTimeout> = {
                ...{ milliseconds: 0, seconds: 0, minutes: 0, hours: 0 },
                ...t,
            }

            timeout = prepared.milliseconds
                + (prepared.seconds * 1000)
                + (prepared.minutes * 60000)
                + (prepared.hours * 3600000)

            return this
        },
        start() {
            polling = true

            if (timeoutID !== null) {
                console.warn('Polling has already started. You should stop the poll before calling start().')
                return this
            }

            schedule()

            return this
        },
        stop() {
            polling = false

            if (timeoutID === null) {
                console.warn('Polling has not yet started. You should start the poll before calling stop().')
                return this
            }

            clearTimeout(timeoutID)

            timeoutID = null

            return this
        },
        polling: () => polling,
    }
}

export { createPoll }
