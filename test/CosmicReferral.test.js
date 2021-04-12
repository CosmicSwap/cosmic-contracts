const { expectRevert } = require('@openzeppelin/test-helpers');
const { assert } = require("chai");

const CosmicToken = artifacts.require('CosmicToken');
const CosmicReferral = artifacts.require('CosmicReferral');

contract('CosmicReferral', ([alice, bob, carol, referrer, operator, owner]) => {
    beforeEach(async () => {
        this.cosmicToken = await CosmicToken.new({ from: owner });
        this.cosmicReferral = await CosmicReferral.new({ from: owner });
        this.zeroAddress = '0x0000000000000000000000000000000000000000';
    });

    it('should allow operator and only owner to update operator', async () => {
        assert.equal((await this.cosmicReferral.operators(operator)).valueOf(), false);
        await expectRevert(this.cosmicReferral.recordReferral(alice, referrer, { from: operator }), 'Operator: caller is not the operator');

        await expectRevert(this.cosmicReferral.updateOperator(operator, true, { from: carol }), 'Ownable: caller is not the owner');
        await this.cosmicReferral.updateOperator(operator, true, { from: owner });
        assert.equal((await this.cosmicReferral.operators(operator)).valueOf(), true);

        await this.cosmicReferral.updateOperator(operator, false, { from: owner });
        assert.equal((await this.cosmicReferral.operators(operator)).valueOf(), false);
        await expectRevert(this.cosmicReferral.recordReferral(alice, referrer, { from: operator }), 'Operator: caller is not the operator');
    });

    it('record referral', async () => {
        assert.equal((await this.cosmicReferral.operators(operator)).valueOf(), false);
        await this.cosmicReferral.updateOperator(operator, true, { from: owner });
        assert.equal((await this.cosmicReferral.operators(operator)).valueOf(), true);

        await this.cosmicReferral.recordReferral(this.zeroAddress, referrer, { from: operator });
        await this.cosmicReferral.recordReferral(alice, this.zeroAddress, { from: operator });
        await this.cosmicReferral.recordReferral(this.zeroAddress, this.zeroAddress, { from: operator });
        await this.cosmicReferral.recordReferral(alice, alice, { from: operator });
        assert.equal((await this.cosmicReferral.getReferrer(alice)).valueOf(), this.zeroAddress);
        assert.equal((await this.cosmicReferral.referralsCount(referrer)).valueOf(), '0');

        await this.cosmicReferral.recordReferral(alice, referrer, { from: operator });
        assert.equal((await this.cosmicReferral.getReferrer(alice)).valueOf(), referrer);
        assert.equal((await this.cosmicReferral.referralsCount(referrer)).valueOf(), '1');

        assert.equal((await this.cosmicReferral.referralsCount(bob)).valueOf(), '0');
        await this.cosmicReferral.recordReferral(alice, bob, { from: operator });
        assert.equal((await this.cosmicReferral.referralsCount(bob)).valueOf(), '0');
        assert.equal((await this.cosmicReferral.getReferrer(alice)).valueOf(), referrer);

        await this.cosmicReferral.recordReferral(carol, referrer, { from: operator });
        assert.equal((await this.cosmicReferral.getReferrer(carol)).valueOf(), referrer);
        assert.equal((await this.cosmicReferral.referralsCount(referrer)).valueOf(), '2');
    });
});
