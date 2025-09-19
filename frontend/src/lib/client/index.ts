export function dataFromFormSubmitEvent(event: SubmitEvent) {
    const formData = new FormData(event.target as HTMLFormElement)
    return Object.fromEntries(formData)
}