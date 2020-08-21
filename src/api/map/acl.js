const permissions = [
    {
        group: 'guest',
        permissions: [
            {
                resource: 'maps/*',
                methods: ['GET'],
                action: 'allow',
                view: ['content', 'author', 'author.name', 'author.email']
            }
        ]
    },
    {
        group: 'user',
        permissions: [
            {
                resource: 'maps/*',
                methods: ['GET'],
                action: 'allow',
                view: ['content', 'author', 'author.name', 'author.email']
            }
        ]
    },
    {
        group: 'admin',
        permissions: [
            {
                resource: 'maps/*',
                methods: ['GET'],
                action: 'allow',
                view: ['content', 'author', 'author.name', 'author.email']
            }
        ]
    }
]

export default permissions
