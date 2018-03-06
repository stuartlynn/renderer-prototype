import * as s from '../../../../../src/core/style/functions';

describe('src/core/style/expressions/animate', () => {
    it('animate(100) should return the elapsed time % since instantiation (100%)', () => {
        const dateSpy = spyOn(Date, 'now').and.returnValue(10000);
        const animate = s.animate(100);

        dateSpy.and.returnValue(10100);
        const actual = animate.eval();
        expect(actual).toEqual(1);
    });

    it('animate(100) should return the elapsed time % since instantiation (50%)', () => {
        const dateSpy = spyOn(Date, 'now').and.returnValue(10000);
        const animate = s.animate(100);

        dateSpy.and.returnValue(10050);
        const actual = animate.eval();
        expect(actual).toEqual(0.5);
    });

    it('animate(100) should return the elapsed time % since instantiation (0%)', () => {
        const dateSpy = spyOn(Date, 'now').and.returnValue(10000);
        const animate = s.animate(100);

        dateSpy.and.returnValue(10000);
        const actual = animate.eval();
        expect(actual).toEqual(0);
    });
});

