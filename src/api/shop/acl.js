const permissions = [
    {
        group: 'guest',
        permissions: [
            {
                resource: 'shops/*',
                methods: ['GET'],
                action: 'allow',
                view: ['name', 'slug', 'contact', 'description', 'address', 'openingHours']
            }
        ]
    },
    {
        group: 'user',
        permissions: [
            {
                resource: 'shops/*',
                methods: ['GET', 'POST', 'PUT', 'DELETE'],
                action: 'allow',
                view: ['name', 'slug', 'contact', 'description', 'address', 'author', 'published', 'openingHours']
            }
        ]
    },
    {
        group: 'admin',
        permissions: [
            {
                resource: 'shops/*',
                methods: ['GET', 'POST', 'PUT', 'DELETE'],
                action: 'allow',
                view: ['_id', 'name', 'slug', 'contact', 'description', 'address', 'author', 'published', 'openingHours']
            }
        ]
    }
]

export default permissions
