import Model, { attr } from '@ember-data/model';

export default class VetvaModel extends Model {
    @attr('boolean') isOn;
    @attr('boolean') isAutomat;
    @attr('string') plan;
    @attr('boolean') automatSaving;
    @attr('boolean') saving;
    @attr('number') openTime;
}
