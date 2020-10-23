const permissions = [
    {
        group: 'guest',
        permissions: [
            {
                resource: 'newsletters/*',
                methods: ['POST'],
                action: 'allow',
                view: []
            }
        ]
    },
    {
        group: 'user',
        permissions: [
            {
                resource: 'newsletters/*',
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
                resource: 'newsletters/*',
                methods: [],
                action: 'allow',
                view: []
            }
        ]
    }
]

export default permissions
