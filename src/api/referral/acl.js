const permissions = [
    {
        group: 'guest',
        permissions: [
            {
                resource: 'referrals/*',
                methods: [],
                action: 'allow',
                view: []
            }
        ]
    },
    {
        group: 'user',
        permissions: [
            {
                resource: 'referrals/*',
                methods: [],
                action: 'allow',
                view: []
            }
        ]
    },
    {
        group: 'admin',
        permissions: [
            {
                resource: 'referrals/*',
                methods: ['POST', 'GET', 'DELETE'],
                action: 'allow',
                view: ['uuid']
            }
        ]
    }
]

export default permissions
