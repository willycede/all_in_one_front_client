import en from './en';
import fr from './fr';
import sp from './sp';
import jp from './jp';
import gr from './gr';

/** Expone claves planas ($t('account.x')) y mantiene alias legacy ($t('message.x')). */
const buildLocale = (messages) => ({
	...messages,
	message: messages,
});

export default {
	en: buildLocale(en),
	fr: buildLocale(fr),
	sp: buildLocale(sp),
	jp: buildLocale(jp),
	gr: buildLocale(gr),
};
