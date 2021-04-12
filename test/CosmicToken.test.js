const { assert } = require("chai");

const CosmicToken = artifacts.require('CosmicToken');

contract('CosmicToken', ([alice, bob, carol, dev, minter]) => {
    beforeEach(async () => {
        this.cosmic = await CosmicToken.new({ from: minter });
        this.burnAddress = '0x000000000000000000000000000000000000dEaD';
    });

    it('mint', async () => {
        await this.cosmic.mint(alice, 1000, { from: minter });
        assert.equal((await this.cosmic.balanceOf(alice)).toString(), '1000');
        assert.equal((await this.cosmic.balanceOf(this.burnAddress)).toString(), '0');

        await this.cosmic.transfer(bob, 10, { from: alice });
        assert.equal((await this.cosmic.balanceOf(alice)).toString(), '990');
        assert.equal((await this.cosmic.balanceOf(bob)).toString(), '10');
        assert.equal((await this.cosmic.balanceOf(this.burnAddress)).toString(), '0');

        await this.cosmic.transfer(bob, 100, { from: alice });
        assert.equal((await this.cosmic.balanceOf(alice)).toString(), '890');
        assert.equal((await this.cosmic.balanceOf(bob)).toString(), '108');
        assert.equal((await this.cosmic.balanceOf(this.burnAddress)).toString(), '2');

        await this.cosmic.approve(carol, 10, { from: alice });
        await this.cosmic.transferFrom(alice, carol, 10, { from: carol });
        assert.equal((await this.cosmic.balanceOf(alice)).toString(), '880');
        assert.equal((await this.cosmic.balanceOf(carol)).toString(), '10');
        assert.equal((await this.cosmic.balanceOf(this.burnAddress)).toString(), '2');

        await this.cosmic.approve(carol, 100, { from: alice });
        await this.cosmic.transferFrom(alice, carol, 100, { from: carol });
        assert.equal((await this.cosmic.balanceOf(alice)).toString(), '780');
        assert.equal((await this.cosmic.balanceOf(carol)).toString(), '108');
        assert.equal((await this.cosmic.balanceOf(this.burnAddress)).toString(), '4');

        await this.cosmic.transfer(this.burnAddress, 1, { from: alice });
        assert.equal((await this.cosmic.balanceOf(alice)).toString(), '779');
        assert.equal((await this.cosmic.balanceOf(this.burnAddress)).toString(), '5');
    });
});
