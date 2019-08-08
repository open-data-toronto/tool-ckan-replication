import json

import ckanapi
import requests

from urllib.parse import urljoin

def lambda_handler(event, context):
    params = json.loads(event['body'])

    # Moving from CKAN A to CKAN B
    a = ckanapi.RemoteCKAN(**params['from'])
    b = ckanapi.RemoteCKAN(**params['to'])

    if params['step'] == 'display':
        body = display(a, b, params['packageID'])
    elif params['step'] == 'replicate':
        try:
            body = replicate(a, b, params['packageID'], params['mode'])
        except:
            clean(b, params['packageID'])

        if not 'prod' in a.address and params['clean']:
            clean(a, params['packageID'])
    else:
        raise Exception('The step {0} is not a validate function for this tool \
            to perform'.format(params['step']))

    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
        },
        'body': json.dumps(body),
    }

def get_package(ckan, pid):
    package = ckan.action.package_show(id=pid)
    package['resources'] = [
        {
            k: v for k, v in r.items() if k in ['id', 'name', 'description', 'datastore_active', 'url', 'extract_job', 'format']
        } for r in package['resources']
    ]

    for k in list(package.keys()):
        if k not in [
            'name', 'title', 'resources',
            'notes', 'collection_method', 'excerpt', 'limitations',
            'dataset_category', 'image_url', 'information_url', 'is_retired', 'refresh_rate', 'tags', 'topics',
            'owner_division', 'owner_section', 'owner_unit', 'owner_email'
        ]:
            package.pop(k)

    if 'tags' in package:
        package['tags'] = ','.join([x['name'] for x in package['tags']])

    return package

def display(a, b, pid):
    try:
        b.action.package_show(id=pid)
        mode = 'update'
    except ckanapi.NotFound:
        mode = 'create'

    package = get_package(a, pid)
    resources = package.pop('resources')

    return {
        'mode': mode,
        'package': package,
        'resources': resources
    }

def replicate(a, b, pid, mode):
    package = get_package(a, pid)
    resources = package.pop('resources')

    if mode == 'create':
        target = b.action.package_create(**package)
    elif mode == 'update':
        package['id'] = package['name']

        target = b.action.package_patch(**package)

    for r in resources:
        r['package_id'] = target['id']

        rid = r.pop('id')
        rurl = r.pop('url')

        if r.pop('datastore_active'):
            context = a.action.datastore_search(
                resource_id=rid,
                limit=0,
                include_total=True
            )

            data = a.action.datastore_search(
                resource_id=rid,
                limit= context['total'],
            )

            p = {
                'fields': [f for f in context['fields'] if f['id'] != '_id'],
                'records': [
                    {
                        k:v for k, v in x.items() if k != '_id'
                    } for x in data['records']
                ]
            }

            for x in target['resources']:
                if x['name'] == r['name']:
                    p['resource_id'] = x['id']

                    b.action.datastore_delete(id=x['id'])
                    break

            if not 'resource_id' in p:
                p['resource'] = r

            b.action.datastore_create(**p)
        else:
            data = requests.get(rurl).content

            func = 'resource_create'
            for x in target['resources']:
                if x['name'] == r['name']:
                    r['id'] = x['id']
                    func = 'resource_patch'
                    break

            nr = requests.post(
                urljoin(b.address, 'api/3/action/{0}'.format(func)),
                data=r,
                headers={
                    'Authorization': b.apikey
                },
                files={
                    'upload': (r['name'] + '.' + r['format'], data)
                }
            )
    return urljoin(b.address, 'dataset/{0}'.format(target['name']))

def clean(ckan, pid):
    ckan.action.dataset_purge(id=pid)
