const ServiceAccess = artifacts.require('ServiceAccess');

contract('ServiceAccess', accounts => {

    it('Should give total access to the owner.', async () => {
        const smc = await ServiceAccess.deployed();

        const owner = await smc.owner();
        const perm0 = await smc.hasPermission(owner, 0);
        const perm1 = await smc.hasPermission(owner, 1);
        const perm5 = await smc.hasPermission(owner, 5);
        const perm100 = await smc.hasPermission(owner, 100);
        const perm255 = await smc.hasPermission(owner, 255);
        assert(perm0 && perm1 && perm5 && perm100 && perm255);
    });

    it('Should give no one else access yet.', async () => {
        const smc = await ServiceAccess.deployed();
        
        const eve = accounts[5];
        const perm0 = await smc.hasPermission(eve, 0);
        const perm1 = await smc.hasPermission(eve, 1);
        const perm5 = await smc.hasPermission(eve, 5);
        const perm100 = await smc.hasPermission(eve, 100);
        const perm255 = await smc.hasPermission(eve, 255);
        assert(!perm0 && !perm1 && !perm5 && !perm100 && !perm255);
    });

    it('Should be able to add permissions.', async () => {
        const smc = await ServiceAccess.deployed();
        const acc = accounts[6];
        await smc.addPermission(acc, 1);
        const perm1 = await smc.hasPermission(acc, 1);
        const perm8 = await smc.hasPermission(acc, 8);
        assert(perm1 && !perm8);
        await smc.addPermission(acc, 5);
        const perm5 = await smc.hasPermission(acc, 5);
        const perm4 = await smc.hasPermission(acc, 4);
        assert(perm5 && !perm4);
        await smc.addPermission(acc, 255);
        const perm255 = await smc.hasPermission(acc, 255);
        assert(perm255);
    });

    it('Should be able to remove permissions.', async() => {
        const smc = await ServiceAccess.deployed();
        const acc = accounts[6];

        let perm1 = await smc.hasPermission(acc, 1);
        assert(perm1);

        await smc.removePermission(acc, 1);
        perm1 = await smc.hasPermission(acc, 1);
        assert(!perm1);
        await smc.removePermission(acc, 5);
        const perm5 = await smc.hasPermission(acc, 5);
        assert(!perm5);
        await smc.removePermission(acc, 255);
        const perm255 = await smc.hasPermission(acc, 255);
        assert(!perm255);
    });

    it('Should be able to provide global access to permissions.', async() => {
        const smc = await ServiceAccess.deployed();
        const A = accounts[6];
        const B = accounts[7];
        const C = accounts[8];

        async function testGlobalAccess(perm) {
            let permA = await smc.hasPermission(A, perm);
            let permB = await smc.hasPermission(B, perm);
            let permC = await smc.hasPermission(C, perm);
            return permA && permB && permC;
        }

        assert(!(await testGlobalAccess(5)));
        await smc.setPublicAccess(5, true);
        assert(await testGlobalAccess(5));

        assert(!(await testGlobalAccess(170)));
        await smc.setPublicAccess(170, true);
        assert(await testGlobalAccess(170));

        assert(!(await testGlobalAccess(255)));
        await smc.setPublicAccess(255, true);
        assert(await testGlobalAccess(255));
    });

    it('Should be able to remove global access.', async() => {
        const smc = await ServiceAccess.deployed();
        const acc = accounts[8];

        await smc.setPublicAccess(5, false);
        assert(!(await smc.hasPermission(acc, 5)));

        await smc.setPublicAccess(170, false);
        assert(!(await smc.hasPermission(acc, 170)));

        await smc.setPublicAccess(255, false);
        assert(!(await smc.hasPermission(acc, 255)));
    });

    it('Should be able to add managers.', async() => {
        const smc = await ServiceAccess.deployed();
        const token = accounts[6];
        const manager = accounts[7];
        
        await smc.setManager(token, manager);
        await smc.addPermission(token, 10);
        let set_manager = await smc.managementAllowance(token);
        let isManager = await smc.isManager(token, manager);
        let notManager = !(await smc.isManager(token, accounts[8]));
        let managerAndPerm10 = await smc.hasPermissionAndIsManager(token, 10, manager);
        let managerAndPerm9 = await smc.hasPermissionAndIsManager(token, 9, manager);

        assert(set_manager == manager, "Manager was not set.");
        assert(isManager, "Manager wasn't registered as the same!");
        assert(notManager, "Wrong Manager");
        assert(managerAndPerm10, "Manager didn't have permissions despite the token being given them.");
        assert(!managerAndPerm9, "Manager shouldn't have permissions if never given.");
    });

    it('Should be able to change managers.', async() => {
        const smc = await ServiceAccess.deployed();
        const token = accounts[6];
        const manager = accounts[7];
        let set_manager = await smc.managementAllowance(token);

        assert(await smc.isManager(token, manager));
        try {
            await smc.setManager(token, accounts[8]);
        }
        catch { /* this should be caught */ }
        set_manager = await smc.managementAllowance(token);

        let is8 = await smc.isManager(token, accounts[8]);
        assert(!is8, "Owner should not be able to set manager after manager was set.");

        await smc.setManager(token, accounts[8], {from: set_manager});
        is8 = await smc.isManager(token, accounts[8]);
        assert(is8, "Manager could not be reset.");
    });
})