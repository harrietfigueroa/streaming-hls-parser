import { isDefined } from '../../../../helpers/isDefined';
import { EXT_X_DATERANGE_PARSED, EXT_X_DATERANGE_STRING } from './type';

export default function (val: EXT_X_DATERANGE_PARSED) {
    const ID = val.ID;
    const CLASS = val.CLASS;
    const START_DATE = val['START-DATE'];
    const END_DATE = val['END-DATE'];
    const DURATION = val.DURATION;
    const PLANNED_DURATION = val['PLANNED-DURATION'];
    const SCTE35_CMD = val['SCTE35-CMD'];
    const SCTE35_OUT = val['SCTE35-OUT'];
    const SCTE35_IN = val['SCTE35-IN'];
    const END_ON_NEXT = val['END-ON-NEXT'];

    const attrs = [`ID="${ID}"`];
    if (CLASS) {
        attrs.push(`CLASS="${CLASS}"`);
    }
    if (START_DATE) {
        attrs.push(`START-DATE="${START_DATE.toISOString()}"`);
    }
    if (END_DATE) {
        attrs.push(`END-DATE="${END_DATE.toISOString()}"`);
    }
    if (DURATION) {
        attrs.push(`DURATION=${DURATION}`);
    }
    if (PLANNED_DURATION) {
        attrs.push(`PLANNED-DURATION=${PLANNED_DURATION}`);
    }
    if (SCTE35_CMD) {
        attrs.push(`SCTE35-CMD=${SCTE35_CMD}`);
    }
    if (SCTE35_OUT) {
        attrs.push(`SCTE35-OUT=${SCTE35_OUT}`);
    }
    if (SCTE35_IN) {
        attrs.push(`SCTE35-IN=${SCTE35_IN}`);
    }
    if (END_ON_NEXT) {
        attrs.push(`END-ON-NEXT=YES`);
    }

    return `#EXT-X-DATERANGE:${attrs.join(',')}` as const satisfies EXT_X_DATERANGE_STRING;
}
