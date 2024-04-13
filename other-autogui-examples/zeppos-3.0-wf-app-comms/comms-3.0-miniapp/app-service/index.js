AppService({
    onInit(params) {
        console.log('====service onInit=======>', new Date().getTime())
    },
    onEvent(params) {
        console.log('index onEvent=', params)
    }
})
