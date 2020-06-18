import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class CronEditComponent extends Component {
    allMinutes = [];
    @tracked minutes = null;
    minuteOptions = [
        { id: 1, label: 'Kazdu minutu', value: '*' },
        { id: 1, label: 'Kazdu parnu minutu', value: '*/2' },
        { id: 1, label: 'Kazdu neparnu minutu', value: '1-59/2' },
        { id: 1, label: 'Kazdych 5 minut ', value: '*/5' },
        { id: 1, label: 'Kazdych 15 minut', value: '*/15' },
        { id: 1, label: 'Kazdych 30 minut', value: '*/30' }
    ];
    @tracked minuteOption = null;
    @tracked minuteValue = null;

    constructor(){
        super(...arguments);

        for(let i=1;i<60;i++){
            this.allMinutes.push(i.toString());
        }

        this.changeMinuteOption(this.minuteOptions[0]);
    }

    @action changeValue(evt){
        this.args.onChange(evt.currentTarget.value);
    }

    @action changeMinuteValue(evt){
        this.minuteValue = evt.currentTarget.value;

        let mo = this.minuteOptions.find(mo=>mo.value===this.minuteValue);
        if(mo){
            this.minuteOption = mo;
            this.minutes = [];
        }else{
            let numbers = this.minuteValue.split(',');
            let minutes = this.allMinutes.filter(m=>numbers.includes(m));
            if(minutes.length){
                this.minuteOption = null;
                this.minutes = minutes;
            }else{
                this.minuteOption = null;
                this.minutes = null;
            }
        }
    }

    @action changeMinuteOption(o){
        this.minuteOption = o;
        this.minuteValue = o.value;
        this.minutes = [];
    }

    @action changeMinutes(ms){
        this.minutes = ms;
        this.minuteValue = ms.join(',');
        this.minuteOption = null;
    }
}
