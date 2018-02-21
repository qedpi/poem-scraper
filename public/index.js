// Connect to server
const socket = io.connect();

const poemsApp = new Vue({
    el: '#poems',
    data: {
        poems: null,
    },
    methods: {
        loadPoem(poems) {
            this.poems = poems;
        },
    },
});

socket.on('poem', poems => poemsApp.loadPoem(poems));