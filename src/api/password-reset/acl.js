const permissions = [
    {
        group: 'guest',
        permissions: [
            {
                resource: 'password-reset/*',
                methods: ['GET', 'POST', 'PATCH'],
                action: 'allow',
            }
        ]
    },
    {
        group: 'user',
        permissions: [
            {
                resource: 'password-reset/*',
                methods: ['GET', 'POST', 'PATCH'],
                action: 'allow',
            }
        ]
    },
    {
        group: 'admin',
        permissions: [
            {
                resource: 'password-reset/*',
                methods: ['GET', 'POST', 'PATCH'],
                action: 'allow',
            }
        ]
    }
]

export default permissions
