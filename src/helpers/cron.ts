import * as cron from 'node-cron';

class CronService {
    constructor() {
        console.log("cron initiated==>")
        this.scheduleEveryThirtySeconds();

    }





    private scheduleEveryThirtySeconds() {
        cron.schedule('*/30 * * * * *', this.everyThirtySecondsTask);
    }




 

    private everyThirtySecondsTask() {
        console.log('Task running every 30 seconds, check pending deposits');
 

    }
}

export default CronService;
